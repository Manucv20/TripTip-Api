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

// Create recommendation endpoint
app.post(
  "/recommendations",
  body("user_id").not().isEmpty().isInt(),
  body("title").not().isEmpty().trim().escape(),
  body("category").not().isEmpty().trim().escape(),
  body("location").not().isEmpty().trim().escape(),
  body("summary").not().isEmpty().trim().escape(),
  body("details").not().isEmpty().trim().escape(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { user_id, title, category, location, summary, details } = req.body;

    try {
      // Insert the recommendation into the database
      const [result, _] = await pool.execute(
        "INSERT INTO recommendations (user_id, title, category, location, summary, details) VALUES (?, ?, ?, ?, ?, ?)",
        [user_id, title, category, location, summary, details]
      );

      return res
        .status(201)
        .json({ message: "Recommendation created successfully" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Read recommendations endpoint
app.get("/recommendations", async (req, res) => {
  try {
    // Retrieve all recommendations from the database
    const [rows, fields] = await pool.execute("SELECT * FROM recommendations");

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
