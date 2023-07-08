const { getConnection } = require("./db");
const { generateError } = require("../helpers");

const createComments = async (user_id, recommendation_id, comment) => {
  let connection;
  try {
    connection = await getConnection();

    // Verificar la existencia del recommendation_id
    const [checkResult] = await connection.query(
      "SELECT id FROM recommendations WHERE id = ?",
      [recommendation_id]
    );

    if (checkResult.length === 0) {
      throw generateError("Esta recomendación no existe.", 404);
    }

    const [insert] = await connection.query(
      "INSERT INTO comments (user_id, recommendation_id, comment) VALUES (?, ?, ?)",
      [user_id, recommendation_id, comment]
    );

    const [result] = await connection.query(
      "SELECT comments.*, users.username as username, users.profile_image as avatar FROM comments INNER JOIN users ON comments.user_id = users.id WHERE comments.id = ?",
      [insert.insertId]
    );

    return result[0];
  } finally {
    if (connection) connection.release();
  }
};

const getCommentsByRecommendations = async (id) => {
  let connection;
  try {
    connection = await getConnection();
    const [result] = await connection.query(
      "SELECT comments.*, users.username as username, users.profile_image as avatar FROM comments INNER JOIN users ON comments.user_id = users.id WHERE recommendation_id = ?",
      [id]
    );
    return result;
  } finally {
    if (connection) connection.release();
  }
};

const getCommentById = async (commentId) => {
  let connection;
  try {
    const connection = await getConnection();
    const [result] = await connection.query(
      "SELECT * FROM comments WHERE id = ?",
      [commentId]
    );
    if (!result.length) {
      throw generateError("Comentario no encontrado", 404);
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
