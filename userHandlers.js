const getUsers = (database) => (req, res) => {
  database
    .query("SELECT * FROM users")
    .then(([users]) => {
      res.json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error retrieving data from the database");
    });
};

const getUserById = (database) => (req, res) => {
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
};

const createUser = (database) => (req, res) => {
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
};

const updateUser = (database) => (req, res) => {
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
};

module.exports = (database) => ({
  getUsers: getUsers(database),
  getUserById: getUserById(database),
  createUser: createUser(database),
  updateUser: updateUser(database),
});
