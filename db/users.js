const { getConnection } = require("../db/db.js");
const { generateError } = require("../helpers");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createUser = async ({ username, email, password }) => {
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
        `"Nombre de usuario" y "correo electrónico" ya existen en nuestra base de datos. Por favor, ingresa otro nombre de usuario y correo electrónico.`,
        409
      );
    }
    if (emailExist.length > 0) {
      throw generateError(
        `"Correo electrónico" ya existe en nuestra base de datos. Por favor, ingresa otro correo electrónico.`,
        409
      );
    }

    if (usernameExist.length > 0) {
      throw generateError(
        `"Nombre de usuario" ya existe en nuestra base de datos. Por favor, ingresa otro nombre de usuario.`,
        409
      );
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const insertUserQuery =
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    const [insertResult] = await connection.query(insertUserQuery, [
      username,
      email,
      hashedPassword,
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
      throw generateError("Correo electrónico o contraseña inválidos.", 404);
    }

    const user = users[0];

    if (!user.isActivated) {
      throw generateError(
        "Cuenta no activada. Por favor, activa tu cuenta primero.",
        403
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw generateError("Correo electrónico o contraseña inválidos.", 404);
    }

    const token = jwt.sign(
      {
        userId: user.id,
        userUsername: user.username,
        userEmail: user.email,
        firstName: user.name,
        lastName: user.lastname,
        imagen: user.profile_image,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );
    return token;
  } catch (err) {
    throw generateError(
      "Nombre de usuario o contraseña incorrectos, por favor revisa los datos.",
      404
    );
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
  profile_image,
  bio
) => {
  let connection;
  try {
    connection = await getConnection();

    const [usernameExist] = await connection.query(
      "SELECT * FROM users WHERE username = ? AND id <> ?",
      [username, userId]
    );

    if (usernameExist.length > 0) {
      throw generateError(
        `"Nombre de usuario" ya existe en nuestra base de datos. Por favor, ingresa otro nombre de usuario.`,
        409
      );
    }
    let updateUserQuery =
      "UPDATE users SET username = ?, name = ?, lastname = ?, address = ?, gender = ?, email = ?, bio = ?";
    const updateParams = [
      username,
      name,
      lastname,
      address,
      gender,
      email,
      bio,
    ];

    if (profile_image) {
      updateUserQuery += ", profile_image = ?"; // Agregar la columna profile_image a la consulta
      updateParams.push(profile_image);
    }

    updateUserQuery += " WHERE id = ?";
    updateParams.push(userId);

    await connection.query(updateUserQuery, updateParams);

    const token = jwt.sign(
      {
        userId: userId,
        userUsername: username,
        userEmail: email,
        firstName: name,
        lastName: lastname,
        imagen: profile_image,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );
    return token;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const getUserById = async (userId) => {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);
    connection.release();
    return rows[0];
  } finally {
    if (connection) connection.release();
  }
};

const getUserByEmail = async (email) => {
  let connection;

  try {
    connection = await getConnection();

    const [result] = await connection.query(
      `
      SELECT *  FROM users WHERE email = ?
    `,
      [email]
    );

    if (result.length === 0) {
      throw generateError(
        "No hay ningún usuario con ese correo electrónico.",
        404
      );
    }

    return result[0];
  } finally {
    if (connection) connection.release();
  }
};

const updatePassword = async ({ password, userId }) => {
  let connection;
  try {
    connection = await getConnection();

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await connection.execute("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      userId,
    ]);

    const user = await getUserById(userId);
    return user;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = {
  createUser,
  login,
  updateUser,
  getUserById,
  getUserByEmail,
  updatePassword,
};
