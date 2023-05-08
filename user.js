const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
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

// Register endpoint
app.post(
  "/register",
  body("name").not().isEmpty().trim().escape(),
  body("lastname").not().isEmpty().trim().escape(),
  body("address").not().isEmpty().trim().escape(),
  body("gender").not().isEmpty().trim().escape(),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, lastname, address, gender, email, password } = req.body;

    try {
      // Check if user already exists
      const [rows, fields] = await pool.execute(
        "SELECT COUNT(*) as count FROM users WHERE email = ?",
        [email]
      );
      if (rows[0].count > 0) {
        return res.status(409).json({ message: "User already exists" });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert the user into the database
      const [result, _] = await pool.execute(
        "INSERT INTO users (name, lastname, address, gender, email, password) VALUES (?, ?, ?, ?, ?, ?)",
        [name, lastname, address, gender, email, hashedPassword]
      );

      return res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Start the server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
