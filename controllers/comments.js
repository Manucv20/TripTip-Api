const { getConnection } = require('../db/db.js');
const {
  newCommentSchema,
  idCommentsSchema,
} = require('../schemas/commentsSchemas');

const newCommentController = async (req, res, next) => {
  try {
    const { error, value } = newCommentSchema.validate(req.body);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    const { user_id, comment } = req.body;
    const recommendation_id = req.params.id;

    // Insert comment into database
    const connection = await getConnection();
    const insertCommentQuery =
      'INSERT INTO comments (user_id, recommendation_id, comment) VALUES (?, ?, ?)';
    await connection.query(insertCommentQuery, [
      user_id,
      recommendation_id,
      comment,
    ]);
    connection.release();

    res.status(200).json({ message: 'Comment posted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getCommentsByRecommendationsController = async (req, res, next) => {
  try {
    const { error } = idCommentsSchema.validate(req.params);
    if (error) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    const recommendationId = req.params.id;
    const connection = await getConnection();
    const [rows] = await connection.query(
      'SELECT comments.*, users.name as username FROM comments INNER JOIN users ON comments.user_id = users.id WHERE recommendation_id = ?',
      [recommendationId]
    );
    connection.release();

    res.status(200).json({ comments: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteCommentsByUserController = async (req, res, next) => {
  try {
    const { error } = idCommentsSchema.validate(req.params);
    if (error) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    const commentId = req.params.id;
    const connection = await getConnection();
    const deleteCommentQuery = 'DELETE FROM comments WHERE id = ?';
    await connection.query(deleteCommentQuery, [commentId]);
    connection.release();

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  newCommentController,
  getCommentsByRecommendationsController,
  deleteCommentsByUserController,
};
