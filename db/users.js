const { generateError } = require('../helper');
const { getConnection } = require('./db');
const bcrypt = require('bcrypt');

//Crear un usuario en la base de datos y devuelve su id
const createUser = async (username, email, password) => {
  let connection;
  try {
    connection = await getConnection();

    //Comprobar que no exista otro usuario con ese email
    const [mail] = await connection.query(
      `
      SELECT id FROM users WHERE email=?
    `,
      [email]
    );

    if (mail.length > 0) {
      throw generateError(
        'Ya existe un usuario en la base de datos con ese email',
        409
      );
    }

    //Comprobar que no exista otro usuario con ese username
    const [user] = await connection.query(
      `
      SELECT id FROM users WHERE email=?
    `,
      [email]
    );

    if (user.length > 0) {
      throw generateError(
        'Ya existe un usuario en la base de datos con ese username',
        409
      );
    }

    //Encriptar la password
    const passwordHash = await bcrypt.hash(password, 10);

    const [newUser] = await connection.query(
      `
      INSERT INTO users (username,email,password) 
      VALUES (?,?,?);
    `,
      [username, email, passwordHash]
    );

    //Devolver la id
    return newUser.insertId;
  } finally {
    if (connection) connection.release();
  }
};

//Crea un perfil de usuario en la base de datos y devuelve su id
const createProfile = async (
  userId,
  name = '',
  lastname = '',
  address = '',
  gender = '',
  image = '',
  bio = ''
) => {
  let connection;
  try {
    connection = await getConnection();

    const [updateUser] = await connection.query(
      `
      UPDATE users 
      SET name=?, lastname=?, address=?, gender=?, image=?, bio=? 
      WHERE id=?;
    `,
      [name, lastname, address, gender, image, bio, userId]
    );

    //Devolver la id
    return updateUser;
  } finally {
    if (connection) connection.release();
  }
};

//login de usuario
const getUserByEmail = async (email) => {
  let connection;

  try {
    connection = await getConnection();

    const [result] = await connection.query(
      `
      SELECT *  FROM users WHERE email=?
    `,
      [email]
    );

    if (result.length === 0) {
      throw generateError('No existe ningún usuario con ese email', 404);
    }

    return result[0];
  } finally {
    if (connection) connection.release();
  }
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
      throw generateError('No existe ningún usuario con ese email', 404);
    }

    return result[0];
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  createUser,
  createProfile,
  getUserByEmail,
  getUserByUsername,
};
