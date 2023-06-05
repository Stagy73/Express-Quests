const getMovies = (database) => (req, res) => {
  database
    .query("SELECT * FROM movies")
    .then(([movies]) => {
      res.json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error retrieving data from the database");
    });
};

const getMovieById = (database) => (req, res) => {
  const id = parseInt(req.params.id);

  database
    .query("SELECT * FROM movies WHERE id = ?", [id])
    .then(([movies]) => {
      if (movies.length > 0) {
        res.json(movies[0]);
      } else {
        res.status(404).send("Movie not found");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error retrieving data from the database");
    });
};

const createMovie = (database) => (req, res) => {
  const { title, director, year } = req.body;

  database
    .query("INSERT INTO movies (title, director, year) VALUES (?, ?, ?)", [
      title,
      director,
      year,
    ])
    .then(() => {
      res.status(201).send("Movie created successfully");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error creating movie");
    });
};

const updateMovie = (database) => (req, res) => {
  const id = parseInt(req.params.id);
  const { title, director, year } = req.body;

  database
    .query("UPDATE movies SET title = ?, director = ?, year = ? WHERE id = ?", [
      title,
      director,
      year,
      id,
    ])
    .then(() => {
      res.status(200).send("Movie updated successfully");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error updating movie");
    });
};

module.exports = (database) => ({
  getMovies: getMovies(database),
  getMovieById: getMovieById(database),
  createMovie: createMovie(database),
  updateMovie: updateMovie(database),
});
