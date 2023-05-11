const { getConnection } = require('./db');
const createComments = async (
  user_id,
  recommendation_id,
  comment,
  image = ''
) => {
  let connection;
  try {
    connection = await getConnection();
    const [result] = await connection.query(
      'INSERT INTO comments (user_id, recommendation_id, comment, image) VALUES (?, ?, ?, ?)',
      [user_id, recommendation_id, comment, image]
    );
    return result.insertId;
  } finally {
    if (connection) connection.release();
  }
};
const getCommentsByRecommendations = async (req, res) => {
  let connection;
  try {
    const recommendationId = req.params.id;
    connection = await getConnection();
    const [result] = await connection.query(
      'SELECT comments.*, users.name as username FROM comments INNER JOIN users ON comments.user_id = users.id WHERE recommendation_id = ?',
      [recommendationId]
    );
    if (result.length === 0) {
      return res
        .status(404)
        .json({ message: 'No comments found for this recommendation' });
    }
    return res.status(200).json({ comments: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

const getCommentById = async (commentId) => {
  let connection
  try {
    const connection = await getConnection();
    const [result] = await connection.query(
      'SELECT * FROM comments WHERE id = ?',
      [commentId]
    );
    if (!result.length) {
      throw new Error('Comment not found');
    }
    return result[0];
  } finally {
    if (connection) connection.release();
  }
};
module.exports = {
  createComments,
  getCommentsByRecommendations,
  getCommentById,
};
