const { generateError } = require("../helpers");
const { getConnection } = require("./db");

//Crear una votacion en la base de datos y devuelve su id
const createVotes = async (user_id, recommendation_id) => {
  let connection;
  let votes = null; // Variable para almacenar la consulta de votos
  try {
    connection = await getConnection();
    // Verificar si el usuario existe
    const [user] = await connection.query("SELECT id FROM users WHERE id = ?", [
      user_id,
    ]);

    if (user.length === 0) {
      throw generateError("Usuario no encontrado", 404);
    }

    // Verificar si ya existe un registro
    const [existingRecord] = await connection.query(
      `
      SELECT * FROM votes
      WHERE user_id = ? AND recommendation_id = ?
    `,
      [user_id, recommendation_id]
    );

    if (existingRecord.length > 0) {
      // Si ya existe un registro, actualizarlo
      await connection.query(
        `
        UPDATE votes
        SET value = CASE
        WHEN value = 0 THEN 1
          ELSE 0
          END
        WHERE user_id = ? AND recommendation_id = ?
      `,
        [user_id, recommendation_id]
      );

      // Devolver el valor actualizado
      const [updatedRecord] = await connection.query(
        `
        SELECT value FROM votes
        WHERE user_id = ? AND recommendation_id = ?
      `,
        [user_id, recommendation_id]
      );

      const [votesResult] = await connection.query(
        "SELECT SUM(value) as votes FROM votes WHERE recommendation_id = ?",
        [recommendation_id]
      );
      votes = votesResult[0].votes; // Asignar el resultado de la consulta a "votes"

      return { success: updatedRecord[0].value === 1, votes };
    } else {
      // Si no existe un registro, insertar uno nuevo
      await connection.query(
        `
        INSERT INTO votes (user_id, recommendation_id) 
        VALUES (?, ?);
      `,
        [user_id, recommendation_id]
      );

      const [votesResult] = await connection.query(
        "SELECT SUM(value) as votes FROM votes WHERE recommendation_id = ?",
        [recommendation_id]
      );
      votes = votesResult[0].votes; // Asignar el resultado de la consulta a "votes"

      return { success: true, votes };
    }
  } finally {
    if (connection) connection.release();
  }
};

const getVotedRecommendationsByUser = async (user_id) => {
  let connection;
  try {
    connection = await getConnection();

    // Obtener los votos del usuario
    const [votedRecommendations] = await connection.query(
      `
      SELECT recommendation_id, value
      FROM votes
      WHERE user_id = ? AND value = 1
    `,
      [user_id]
    );

    return votedRecommendations;
  } finally {
    if (connection) connection.release();
  }
};

const deleteVoteByUserAndRecommendation = async (user_id, recommendation_id) => {
  let connection;
  try {
    connection = await getConnection();

    // Verificar si el usuario existe
    const [user] = await connection.query("SELECT id FROM users WHERE id = ?", [user_id]);

    if (user.length === 0) {
      throw generateError("Usuario no encontrado", 404);
    }

    // Verificar si existe un registro de voto para el usuario y la publicación
    const [existingRecord] = await connection.query(
      `
      SELECT * FROM votes
      WHERE user_id = ? AND recommendation_id = ?
    `,
      [user_id, recommendation_id]
    );

    if (existingRecord.length === 0) {
      throw generateError("El voto no existe", 404);
    }

    // Eliminar el voto
    await connection.query(
      `
      DELETE FROM votes
      WHERE user_id = ? AND recommendation_id = ?
    `,
      [user_id, recommendation_id]
    );

    return { success: true };
  } catch (error) {
    throw error;
  } finally {
    if (connection) connection.release();
  }
};


module.exports = {
  getVotedRecommendationsByUser,
  createVotes,
  deleteVoteByUserAndRecommendation,
};
