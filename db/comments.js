const { getConnection } = require('./db');
const createComments = async (user_id, recommendation_id, comment) => {
  let connection;
  try {
    connection = await getConnection();
    const [result] = await connection.query(
      'INSERT INTO comments (user_id, recommendation_id, comment) VALUES (?, ?, ?)',
      [user_id, recommendation_id, comment]
    );
    return result.insertId;
  } finally {
    if (connection) connection.release();
  }
};

module.exports = { createComments };
