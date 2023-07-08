const { generateError } = require("../helpers");
const { getConnection } = require("./db");
const { getUserById } = require("./users");

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

const updateEmail = async ({ email, userId }) => {
  let connection;
  try {
    connection = await getConnection();

    const [emailExist] = await connection.query(
      "SELECT * FROM users WHERE email = ? AND id <> ?",
      [email, userId]
    );

    if (emailExist.length > 0) {
      throw generateError(
        `"Correo electrónico" ya existe en nuestra base de datos. Por favor, ingresa otro correo electrónico.`,
        409
      );
    }

    await connection.execute(
      "UPDATE users SET email = ?, isActivated = false WHERE id = ?",
      [email, userId]
    );

    const user = await getUserById(userId);
    return user;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = {
  createEmailVerification,
  getUserByToken,
  activateUser,
  updateEmail,
};
