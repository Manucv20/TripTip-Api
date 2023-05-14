const { getConnection } = require("../db/db.js");
const { generateError } = require("../helpers");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createUser = async ({
  username,
  name,
  lastname,
  address,
  gender,
  email,
  password,
  bio,
}) => {
  let connection;
  try {
    connection = await getConnection();
    const [emailExist] = await connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    const [usernameExist] = await connection.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    if (emailExist.length > 0 && usernameExist.length > 0) {
      throw generateError(
        "A user with this email and username already exists in the database",
        409
      );
    }
    if (emailExist.length > 0) {
      throw generateError(
        "A user with this email already exists in the database",
        409
      );
    }

    if (usernameExist.length > 0) {
      throw generateError(
        "A user with this username already exists in the database",
        409
      );
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const insertUserQuery =
      "INSERT INTO users (username,name,lastname, address, gender, email, password, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    const insertResult = await connection.query(insertUserQuery, [
      username,
      name,
      lastname,
      address,
      gender,
      email,
      hashedPassword,
      bio,
    ]);

    return insertResult.insertId;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const login = async (email, password) => {
  let connection;
  try {
    connection = await getConnection();

    const [users] = await connection.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      throw generateError("Invalid email or password", 404);
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw generateError("Invalid email or password", 404);
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    const userData = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
    };

    return { token, userData };
  } catch (err) {
    throw generateError("Invalid email or password", 404);
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const updateUser = async (
  userId,
  username,
  name,
  lastname,
  address,
  gender,
  email,
  password,
  profile_image,
  bio
) => {
  let connection;
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    connection = await getConnection();
    const updateUserQuery =
      "UPDATE users SET username = ?, name = ?, lastname = ?, address = ?, gender = ?, email = ?, password = ?, profile_image = ?, bio = ? WHERE id = ?";
    await connection.query(updateUserQuery, [
      username,
      name,
      lastname,
      address,
      gender,
      email,
      hashedPassword,
      profile_image,
      bio,
      userId,
    ]);
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const getUserById = async (userId) => {
  const connection = await getConnection();
  const [rows] = await connection.query("SELECT * FROM users WHERE id = ?", [
    userId,
  ]);
  connection.release();
  return rows[0];
};

const getUserByUsername = async (username) => {
  let connection;

  try {
    connection = await getConnection();

    const [result] = await connection.query(
      `
      SELECT *  FROM users WHERE username=?
    `,
      [username]
    );

    if (result.length === 0) {
      throw generateError("There is no user with that username", 404);
    }

    return result[0];
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  createUser,
  login,
  updateUser,
  getUserById,
  getUserByUsername,
};
