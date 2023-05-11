const { getConnection } = require('../db/db.js');
const Joi = require('joi');
const { newVoteSchema } = require('../schemas/votesSchemas');

const NewVoteController = async (req, res, next) => {
  let connection;
  try {
    const { error, value } = NewVoteSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    connection = await getConnection();

    const { user_id, recommendation_id, vote_value } = req.body;

    // Check if user already voted for this recommendation
    const query = `
      SELECT * FROM votes
      WHERE user_id = ? AND recommendation_id = ?
    `;
    const [rows] = await connection.query(query, [user_id, recommendation_id]);

    if (rows.length > 0) {
      return res.status(400).json({
        error: 'User already voted for this recommendation',
      });
    }

    const insertVoteQuery =
      'INSERT INTO votes (user_id, recommendation_id, vote_value) VALUES (?, ?, ?)';
    await connection.query(insertVoteQuery, [
      user_id,
      recommendation_id,
      value,
    ]);

    res.status(200).json({ message: 'Vote created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = {
  NewVoteController,
};
