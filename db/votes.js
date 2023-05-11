const { generateError } = require('../helpers');
const { getConnection } = require('./db');

//Crear una votacion en la base de datos y devuelve su id
const createVotes = async (user_id, recomendation_id, value = 1) => {
  let connection;
  try {
    connection = await getConnection();
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
    } else {
      // Si no existe un registro, insertar uno nuevo
      const [newVotes] = await connection.query(
        `
        INSERT INTO votes (user_id, recommendation_id, value) 
        VALUES (?, ?, ?);
      `,
        [user_id, recomendation_id, value]
      );

      // Devolver la id
      return newVotes.insertId;
    }
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  createVotes,
};
