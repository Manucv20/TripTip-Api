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

    const [result] = await connection.query(
      "INSERT INTO comments (user_id, recommendation_id, comment) VALUES (?, ?, ?)",
      [user_id, recommendation_id, comment]
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
      "SELECT comments.*, users.name as username FROM comments INNER JOIN users ON comments.user_id = users.id WHERE recommendation_id = ?",
      [recommendationId]
    );
    if (result.length === 0) {
      throw generateError(
        "No se encontraron comentarios para esta recomendación.",
        404
      );
    }
    return res.status(200).json({ comments: result });
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
