const express = require("express");
const Joi = require("joi");
const dotenv = require("dotenv");
const mysql = require("mysql2/promise");

dotenv.config();

const app = express();
const port = process.env.APP_PORT || 5000;

const welcome = (req, res) => {
  res.send("Welcome to my favorite movie list");
};

// Database connection
const database = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

database
  .getConnection()
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((err) => {
    console.error(err);
  });

// Middleware to validate movie data
const validateMovie = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    director: Joi.string().required(),
    year: Joi.number()
      .integer()
      .min(1900)
      .max(new Date().getFullYear())
      .required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(422).json({ error: error.details[0].message });
  }

  next();
};

// Middleware to validate user data
const validateUser = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(422).json({ error: error.details[0].message });
  }

  next();
};

app.get("/", welcome);

// Movie routes
app.get("/api/movies", (req, res) => {
  database
    .query("SELECT * FROM movies")
    .then(([movies]) => {
      res.json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error retrieving data from the database");
    });
});

app.get("/api/movies/:id", (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).send("Invalid movie ID");
  }
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
});

app.post("/api/movies", validateMovie, (req, res) => {
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
});

app.put("/api/movies/:id", validateMovie, (req, res) => {
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
});

// User routes
app.get("/api/users", (req, res) => {
  database
    .query("SELECT * FROM users")
    .then(([users]) => {
      res.json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error retrieving data from the database");
    });
});

app.get("/api/users/:id", (req, res) => {
  const id = parseInt(req.params.id);

  database
    .query("SELECT * FROM users WHERE id = ?", [id])
    .then(([users]) => {
      if (users.length > 0) {
        res.json(users[0]);
      } else {
        res.status(404).send("User not found");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error retrieving data from the database");
    });
});

app.post("/api/users", validateUser, (req, res) => {
  const { name, email } = req.body;

  database
    .query("INSERT INTO users (name, email) VALUES (?, ?)", [name, email])
    .then(([result]) => {
      const newUser = {
        id: result.insertId,
        name,
        email,
      };
      res.status(201).json(newUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error creating user");
    });
});

app.put("/api/users/:id", validateUser, (req, res) => {
  const id = parseInt(req.params.id);
  const { name, email } = req.body;

  database
    .query("UPDATE users SET name = ?, email = ? WHERE id = ?", [
      name,
      email,
      id,
    ])
    .then(() => {
      res.status(200).send("User updated successfully");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error updating user");
    });
});

app.listen(port, (err) => {
  if (err) {
    console.error("Something bad happened");
  } else {
    console.log(`Server is listening on ${port}`);
  }
});
