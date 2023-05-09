const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

// Set up middleware to parse JSON requests
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

// Route to handle user registration
app.post("/register", async (req, res) => {
  try {
    const {
      name,
      lastname,
      address,
      gender,
      email,
      password,
      profile_image,
      bio,
    } = req.body;

    // Check if email is already in use
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length > 0) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user into database
    const insertUserQuery =
      "INSERT INTO users (name, lastname, address, gender, email, password, profile_image, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    await pool.query(insertUserQuery, [
      name,
      lastname,
      address,
      gender,
      email,
      hashedPassword,
      profile_image,
      bio,
    ]);

    res.status(200).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/recommendations", async (req, res) => {
  try {
    const { location, category } = req.query;

    let searchQuery = "SELECT * FROM recommendations WHERE 1=1";
    let searchParams = [];

    if (location) {
      searchQuery += " AND location = ?";
      searchParams.push(location);
    }

    if (category) {
      searchQuery += " AND category = ?";
      searchParams.push(category);
    }

    searchQuery +=
      " ORDER BY (SELECT COUNT(*) FROM votes WHERE votes.recommendation_id = recommendations.id) DESC";

    const [rows] = await pool.query(searchQuery, searchParams);

    res.status(200).json({ recommendations: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/recommendations/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [recommendations] = await pool.query(
      "SELECT * FROM recommendations WHERE id = ?",
      [id]
    );
    const [votes] = await pool.query(
      "SELECT COUNT(*) as count FROM votes WHERE recommendation_id = ?",
      [id]
    );
    const [comments] = await pool.query(
      "SELECT comments.*, users.name FROM comments INNER JOIN users ON comments.user_id = users.id WHERE comments.recommendation_id = ?",
      [id]
    );

    if (recommendations.length === 0) {
      return res.status(404).json({ error: "Recommendation not found" });
    }

    const recommendation = recommendations[0];

    res.status(200).json({ recommendation, votes: votes[0].count, comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Route to get recommendations ordered by votes
app.get("/recommendations/orderedByVotes", async (req, res) => {
  try {
    const query = `
      SELECT r.*, COUNT(v.value) AS votes
      FROM recommendations r
      LEFT JOIN votes v ON v.recommendation_id = r.id
      GROUP BY r.id
      ORDER BY votes DESC
    `;

    const [rows] = await pool.query(query);

    res.status(200).json({ recommendations: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Route to create a new recommendation
app.post("/recommendations", async (req, res) => {
  try {
    const { user_id, title, category, location, summary, details, image } =
      req.body;

    const query = `
      INSERT INTO recommendations (user_id, title, category, location, summary, details, image)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [
      user_id,
      title,
      category,
      location,
      summary,
      details,
      image,
    ]);

    res.status(200).json({
      message: "Recommendation created successfully",
      recommendation_id: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Route to create a new vote
app.post("/votes", async (req, res) => {
  try {
    const { user_id, recommendation_id, value } = req.body;

    // Check if user already voted for this recommendation
    const query = `
      SELECT * FROM votes
      WHERE user_id = ? AND recommendation_id = ?
    `;
    const [rows] = await pool.query(query, [user_id, recommendation_id]);

    if (rows.length > 0) {
      return res.status(400).json({
        error: "User already voted for this recommendation",
      });
    }

    const insertVoteQuery =
      "INSERT INTO votes (user_id, recommendation_id, value) VALUES (?, ?, ?)";
    await pool.query(insertVoteQuery, [user_id, recommendation_id, value]);

    res.status(200).json({ message: "Vote created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Route to delete a recommendation
app.delete("/recommendations/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deleteQuery = "DELETE FROM recommendations WHERE id = ?";
    const [result] = await pool.query(deleteQuery, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Recommendation not found" });
    }

    res.status(200).json({ message: "Recommendation deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Route to handle posting a comment on a recommendation
app.post("/recommendations/:id/comments", async (req, res) => {
  try {
    const { user_id, comment } = req.body;
    const recommendation_id = req.params.id;

    // Insert comment into database
    const insertCommentQuery =
      "INSERT INTO comments (user_id, recommendation_id, comment) VALUES (?, ?, ?)";
    await pool.query(insertCommentQuery, [user_id, recommendation_id, comment]);

    res.status(200).json({ message: "Comment posted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Route to handle getting user profile information
app.get("/users/:id", async (req, res) => {
  try {
    const user_id = req.params.id;

    // Retrieve user profile information from database
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [
      user_id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get recommendations by user id
app.get("/users/:id/recommendations", async (req, res) => {
  try {
    const userId = req.params.id;
    const [rows] = await pool.query(
      "SELECT * FROM recommendations WHERE user_id = ?",
      [userId]
    );
    res.status(200).json({ recommendations: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get comments by recommendation id
app.get("/recommendations/:id/comments", async (req, res) => {
  try {
    const recommendationId = req.params.id;
    const [rows] = await pool.query(
      "SELECT comments.*, users.name as username FROM comments INNER JOIN users ON comments.user_id = users.id WHERE recommendation_id = ?",
      [recommendationId]
    );
    res.status(200).json({ comments: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Add comment to recommendation
app.post("/recommendations/:id/comments", async (req, res) => {
  try {
    const recommendationId = req.params.id;
    const { user_id, comment } = req.body;
    const insertCommentQuery =
      "INSERT INTO comments (user_id, recommendation_id, comment) VALUES (?, ?, ?)";
    await pool.query(insertCommentQuery, [user_id, recommendationId, comment]);
    res.status(200).json({ message: "Comment added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update user profile
app.put("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, lastname, address, gender, email, profile_image, bio } =
      req.body;
    const updateUserQuery =
      "UPDATE users SET name = ?, lastname = ?, address = ?, gender = ?, email = ?, profile_image = ?, bio = ? WHERE id = ?";
    await pool.query(updateUserQuery, [
      name,
      lastname,
      address,
      gender,
      email,
      profile_image,
      bio,
      userId,
    ]);
    res.status(200).json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete comment
app.delete("/comments/:id", async (req, res) => {
  try {
    const commentId = req.params.id;
    const deleteCommentQuery = "DELETE FROM comments WHERE id = ?";
    await pool.query(deleteCommentQuery, [commentId]);
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Start server
app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
