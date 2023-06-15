const { getConnection } = require("./db");

const createEmailVerification = async ({ userId, token }) => {
  let connection;
  try {
    connection = await getConnection();

    const insertEmailVerificationQuery =
      "INSERT INTO email_verification (user_id, token) VALUES (?, ?)";
    await connection.query(insertEmailVerificationQuery, [userId, token]);
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const getUserByToken = async (token) => {
  let connection;
  try {
    connection = await getConnection();

    const [user] = await connection.execute(
      "SELECT * FROM users WHERE id IN (SELECT user_id FROM email_verification WHERE token = ?)",
      [token]
    );

    return user[0];
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const activateUser = async (userId) => {
  let connection;
  try {
    connection = await getConnection();

    await connection.execute(
      "UPDATE users SET isActivated = true WHERE id = ?",
      [userId]
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = { createEmailVerification, getUserByToken, activateUser };
