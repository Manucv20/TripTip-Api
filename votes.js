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

// Create vote endpoint
app.post(
  "/votes",
  body("user_id").not().isEmpty().isInt(),
  body("recommendation_id").not().isEmpty().isInt(),
  body("value").not().isEmpty().isInt(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { user_id, recommendation_id, value } = req.body;

    try {
      // Insert the vote into the database
      const [result, _] = await pool.execute(
        "INSERT INTO votes (user_id, recommendation_id, value) VALUES (?, ?, ?)",
        [user_id, recommendation_id, value]
      );

      return res.status(201).json({ message: "Vote created successfully" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Read votes endpoint
app.get("/votes", async (req, res) => {
  try {
    // Retrieve all votes from the database
    const [rows, fields] = await pool.execute("SELECT * FROM votes");

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
