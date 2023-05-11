const { getConnection } = require('../db/db.js');
const Joi = require('joi');
const {
  newRecommendationSchema,
  idRecommendationSchema,
  getRecommendationsByLocationAndCategorySchema,
} = require('../schemas/recommendationsSchemas');
const newRecommendationController = async (req, res, next) => {
  let connection;
  try {
    connection = await getConnection();
    const { error } = newRecommendationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { user_id, title, category, location, summary, details, image } =
      req.body;

    const query = `
      INSERT INTO recommendations (user_id, title, category, location, summary, details, image)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await connection.query(query, [
      user_id,
      title,
      category,
      location,
      summary,
      details,
      image,
    ]);

    res.status(200).json({
      message: 'Recommendation created successfully',
      recommendation_id: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const deleteRecommendationController = async (req, res, next) => {
  let connection;
  try {
    connection = await getConnection();
    const { error } = idRecommendationSchema.validate(req.params);
    if (error) {
      throw new Error(error.details[0].message);
    }
    const { id } = req.params;

    const deleteQuery = 'DELETE FROM recommendations WHERE id = ?';
    const [result] = await connection.query(deleteQuery, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }

    res.status(200).json({ message: 'Recommendation deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const getRecommendationController = async (req, res, next) => {
  let connection;
  try {
    connection = await getConnection();
    const { error, value } = idRecommendationSchema.validate(req.params);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { id } = req.params;

    const [recommendations] = await connection.query(
      'SELECT * FROM recommendations WHERE id = ?',
      [id]
    );
    const [votes] = await connection.query(
      'SELECT COUNT(*) as count FROM votes WHERE recommendation_id = ?',
      [id]
    );
    const [comments] = await connection.query(
      'SELECT comments.*, users.name FROM comments INNER JOIN users ON comments.user_id = users.id WHERE comments.recommendation_id = ?',
      [id]
    );

    if (recommendations.length === 0) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }

    const recommendation = recommendations[0];

    res.status(200).json({ recommendation, votes: votes[0].count, comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const getRecommendationsByLocationAndCategoryController = async (
  req,
  res,
  next
) => {
  let connection;

  try {
    const { error, value } =
      getRecommendationsByLocationAndCategorySchema.validate(req.query);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    connection = await getConnection();
    const { location, category } = req.query;

    let searchQuery = 'SELECT * FROM recommendations WHERE 1=1';
    let searchParams = [];

    if (location) {
      searchQuery += ' AND location = ?';
      searchParams.push(location);
    }

    if (category) {
      searchQuery += ' AND category = ?';
      searchParams.push(category);
    }

    searchQuery +=
      ' ORDER BY (SELECT COUNT(*) FROM votes WHERE votes.recommendation_id = recommendations.id) DESC';

    const [rows] = await connection.query(searchQuery, searchParams);

    res.status(200).json({ recommendations: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

const getRecommendationOrderedByVotesController = async (req, res, next) => {
  let connection;

  try {
    connection = await getConnection();
    const query = `
      SELECT r.*, COUNT(v.value) AS votes
      FROM recommendations r
      LEFT JOIN votes v ON v.recommendation_id = r.id
      GROUP BY r.id
      ORDER BY votes DESC
    `;

    const [rows] = await connection.query(query);

    res.status(200).json({ recommendations: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

const getRecommendationByUserController = async (req, res, next) => {
  let connection;

  try {
    connection = await getConnection();

    const { error } = idRecommendationSchema.validate(req.params);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const userId = req.params.id;
    const [rows] = await connection.query(
      'SELECT * FROM recommendations WHERE user_id = ?',
      [userId]
    );
    res.status(200).json({ recommendations: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  newRecommendationController,
  deleteRecommendationController,
  getRecommendationController,
  getRecommendationsByLocationAndCategoryController,
  getRecommendationOrderedByVotesController,
  getRecommendationByUserController,
};
