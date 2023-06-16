const { generateError } = require("../helpers");
const { getConnection } = require("./db");

//Crear una votacion en la base de datos y devuelve su id
const createVotes = async (user_id, recomendation_id) => {
  let connection;
  try {
    connection = await getConnection();
    // Verificar si el usuario existe
    const [user] = await connection.query("SELECT id FROM users WHERE id = ?", [
      user_id,
    ]);

    if (user.length === 0) {
      throw generateError("User not found", 404);
    }

    // Verificar si ya existe un registro
    const [existingRecord] = await connection.query(
      `
      SELECT * FROM votes
      WHERE user_id = ? AND recommendation_id = ?
    `,
      [user_id, recomendation_id]
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
        [user_id, recomendation_id]
      );

      // Devolver el valor actualizado
      const [updatedRecord] = await connection.query(
        `
        SELECT value FROM votes
        WHERE user_id = ? AND recommendation_id = ?
      `,
        [user_id, recomendation_id]
      );

      return updatedRecord[0].value === 1;
    } else {
      // Si no existe un registro, insertar uno nuevo
      await connection.query(
        `
        INSERT INTO votes (user_id, recommendation_id) 
        VALUES (?, ?);
      `,
        [user_id, recomendation_id]
      );
      // Devolver la id
      return true;
    }
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  createVotes,
};
