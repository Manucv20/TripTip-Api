const express = require("express");
const mysql = require("mysql2/promise");
const { body, validationResult } = require("express-validator");

const app = express();
app.use(express.json());

// Set up MySQL connection
const pool = mysql.createPool({
  host: "localhost",
  user: "demo",
  password: "password",
  database: "proyectotrip",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Create comment endpoint
app.post(
  "/comments",
  body("user_id").not().isEmpty().isInt(),
  body("recommendation_id").not().isEmpty().isInt(),
  body("comment").not().isEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { user_id, recommendation_id, comment } = req.body;

    try {
      // Insert the comment into the database
      const [result, _] = await pool.execute(
        "INSERT INTO comments (user_id, recommendation_id, comment) VALUES (?, ?, ?)",
        [user_id, recommendation_id, comment]
      );

      return res.status(201).json({ message: "Comment created successfully" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Read comments endpoint
app.get("/comments", async (req, res) => {
  try {
    // Retrieve all comments from the database
    const [rows, fields] = await pool.execute("SELECT * FROM comments");

    return res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Start the server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
