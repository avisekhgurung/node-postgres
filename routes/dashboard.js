const router = require("express").Router();
const authorize = require("../middleware/authorize");
const pool = require("../db");

//all todos and name
router.get("/", authorize, async (req, res) => {
  try {

    // get todo name and description for a specified user id
    const user = await pool.query(
      "SELECT u.user_name, t.todo_id, t.title,  t.description, t.priority, t.due_date,  t.status, t.created_at FROM users AS u LEFT JOIN todos AS t ON u.user_id = t.user_id WHERE u.user_id = $1",
      [req.user.id]
    );

    res.json(user.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//create a todo, using authorize middleware
router.post("/todos", authorize, async (req, res) => {
  try {
    console.log(req.body);
    const { title, description, priority, due_date } = req.body;
    const newTodo = await pool.query(
      "INSERT INTO todos (user_id, title, description, priority, due_date ) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [req.user.id, title, description, priority, due_date]
    );

    res.json(newTodo.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

//update a todo
router.put("/todos/:id", authorize, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, due_date } = req.body;
    const updateTodo = await pool.query(
      "UPDATE todos SET title = $1, description = $2, priority = $3, due_date = $4 WHERE todo_id = $5 AND user_id = $6 RETURNING *",
      // "UPDATE todos SET description = $1, title = $4, due_date = $5, priority = $6 WHERE todo_id = $2 AND user_id = $3 RETURNING *;",
      [title, description, priority, due_date, id, req.user.id]
    );

    if (updateTodo.rows.length === 0) {
      return res.json("This todo is not yours");
    }

    res.json("Todo was updated");
  } catch (err) {
    console.error(err.message);
  }
});


//update status
router.put("/todos/:id/status", authorize, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updateTodo = await pool.query(
      "UPDATE todos SET status = $1 WHERE todo_id = $2 AND user_id = $3 RETURNING *",
      [status, id, req.user.id]
    );

    if (updateTodo.rows.length === 0) {
      return res.json("This todo is not yours");
    }

    res.json("Todo status was updated");
  } catch (err) {
    console.error(err.message);
  }
});

//delete a todo
router.delete("/todos/:id", authorize, async (req, res) => {
  try {
    const { id } = req.params;
    const deleteTodo = await pool.query(
      "DELETE FROM todos WHERE todo_id = $1 AND user_id = $2 RETURNING *",
      [id, req.user.id]
    );

    if (deleteTodo.rows.length === 0) {
      return res.json("This todo is not yours");
    }

    res.json("Todo was deleted");
  } catch (err) {
    console.error(err.message);
  }
});

module.exports = router;
