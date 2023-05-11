const { getConnection } = require('../db/db.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const createUser = async ({
  name,
  lastname,
  address,
  gender,
  email,
  password,
  profile_image,
  bio,
}) => {
  let connection;
  try {
    connection = await getConnection();
    const [user] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (user.length > 0) {
      throw new Error('Email already in use');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const insertUserQuery =
      'INSERT INTO users (name, lastname, address, gender, email, password, profile_image, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const insertResult = await connection.query(insertUserQuery, [
      name,
      lastname,
      address,
      gender,
      email,
      hashedPassword,
      profile_image,
      bio,
    ]);

    return insertResult.insertId;
  } catch (error) {
    throw new Error(error.message);
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

    const [users] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d'});

    return token;
  } catch (err) {
    throw new Error(err.message);
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const updateUser = async (
  userId,
  { name, lastname, address, gender, email, profile_image, bio }
) => {
  const connection = await getConnection();

  try {
    const updateUserQuery =
      'UPDATE users SET name = ?, lastname = ?, address = ?, gender = ?, email = ?, profile_image = ?, bio = ? WHERE id = ?';

    await connection.query(updateUserQuery, [
      name,
      lastname,
      address,
      gender,
      email,
      profile_image,
      bio,
      userId,
    ]);
  } catch (err) {
    console.error(err);
    throw new Error('Error updating user');
  } finally {
    connection.release();
  }
};

const getUserById = async (userId) => {
  const connection = await getConnection();
  const [rows] = await connection.query('SELECT * FROM users WHERE id = ?', [
    userId,
  ]);
  connection.release();
  return rows[0];
};
module.exports = { createUser, login, updateUser, getUserById };
