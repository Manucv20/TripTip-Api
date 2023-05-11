const { generateError } = require('../helper');
const { getConnection } = require('./db');

//Crear una recomendación en la base de datos y devuelve su id
const createRecommendation = async (
  userId,
  title,
  category,
  location,
  sumary,
  details,
  image = ''
) => {
  let connection;
  try {
    connection = await getConnection();
    //Crear una recomendacion
    const [newRecommendation] = await connection.query(
      `
      INSERT INTO recommendations (user_id, title, category, location, summary, details, image) 
      VALUES (?,?,?,?,?,?,?);
    `,
      [userId, title, category, location, sumary, details, image]
    );

    //Devolver la id
    return newRecommendation.insertId;
  } finally {
    if (connection) connection.release();
  }
};

//muestra todos los registros de la tabla recommendations
const getAllRecommendations = async () => {
  let connection;

  try {
    connection = await getConnection();

    const [result] = await connection.query(
      `
      SELECT * FROM recommendations ORDER BY created_at DESC
    `
    );

    return result;
  } finally {
    if (connection) connection.release();
  }
};

//muestra los datos de un registro de la tabla recomendations
const getRecommendationById = async (id) => {
  let connection;

  try {
    connection = await getConnection();

    const [result] = await connection.query(
      `
      SELECT * FROM recommendations WHERE id = ?
    `,
      [id]
    );

    if (result.length === 0) {
      throw generateError(`La recomendation con id: ${id} no existe`, 404);
    }

    return result[0];
  } finally {
    if (connection) connection.release();
  }
};

//Muestra el resultado de la busqueda de recomendaciones por lugar o categoria
const getRecommendation = async (lugar, categoria) => {
  let connection;

  try {
    connection = await getConnection();

    const [recomendaciones] = await connection.query(
      `SELECT r.*, SUM(v.value) AS total_votes
        FROM recommendations r
        LEFT JOIN votes v ON r.id = v.recommendation_id
        WHERE r.location LIKE ? AND r.category LIKE ?
        GROUP BY r.id
        ORDER BY total_votes DESC;`,
      [`%${lugar}%`, `%${categoria}%`]
    );

    return recomendaciones;
  } finally {
    if (connection) connection.release();
  }
};

//Elimina tu propia recomendación
const deleteRecommendationById = async (id) => {
  let connection;

  try {
    connection = await getConnection();

    await connection.query(
      `
      DELETE FROM recommendations WHERE id = ?
    `,
      [id]
    );

    return;
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  createRecommendation,
  getAllRecommendations,
  getRecommendationById,
  getRecommendation,
  deleteRecommendationById,
};
