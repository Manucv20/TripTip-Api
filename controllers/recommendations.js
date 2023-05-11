const { generateError, createPathIfNotExists } = require('../helper');

const {
  createRecommendation,
  getAllRecommendations,
  getRecommendationById,
  getRecommendation,
  deleteRecommendationById,
} = require('../db/recommendations');

const Joi = require('joi');
const path = require('path');
const sharp = require('sharp');
const crypto = require('crypto');

// Genera un nombre aleatorio de N caracteres para la imagen
const randomName = (n) => crypto.randomBytes(n).toString('hex');

//Crea un nuevo registro de recomendaciones
const newRecommendationController = async (req, res, next) => {
  try {
    const { title, category, location, sumary, details } = req.body;

    //Plantilla para el registro
    const userSchema = Joi.object().keys({
      title: Joi.string().max(100),
      category: Joi.string().max(50),
      location: Joi.string().max(100),
      sumary: Joi.string().max(100),
      details: Joi.string().max(5000),
    });

    const validation = userSchema.validate(req.body);

    if (validation.error) {
      throw generateError(
        'Debes introducir los valores requeridos correctamente',
        400
      );
    }

    let imageFileName;

    if (req.files?.image) {
      //Creo el path del directorio uploads
      const uploadsDir = path.join(__dirname, '../uploads');
      //Creo el directorio si no existe
      await createPathIfNotExists(uploadsDir);
      //Procesar la imagen
      const image = sharp(req.files.image.data);
      image.resize(256);
      //Guardo la imagen con un nombre aleatorio en el directorio uploads
      imageFileName = `${randomName(16)}.jpg`;

      await image.toFile(path.join(uploadsDir, imageFileName));
    }

    const id = await createRecommendation(
      req.userId,
      title,
      category,
      location,
      sumary,
      details,
      imageFileName
    );

    res.send({
      status: 'OK',
      message: `Recommendation created with id: ${id}`,
    });
  } catch (e) {
    next(e);
  }
};

//Mostrar todas las recomendaciones
const listaRecommendationsController = async (req, res, next) => {
  try {
    const recommendations = await getAllRecommendations();
    res.send({
      status: 'OK',
      data: recommendations,
    });
  } catch (e) {
    next(e.message);
  }
};

//Mostrar detalles de una recomendacion
const getRecommendationController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const recommendation = await getRecommendationById(id);
    if (recommendation) {
      console.log(recommendation.id);
    }
    res.send({
      status: 'OK',
      data: recommendation,
    });
  } catch (e) {
    next(e);
  }
};

//Buscar recomendaciones por lugar o categoria
const getRecommendationByLugarAndCategory = async (req, res, next) => {
  try {
    console.log('Paso por aqui');
    const lugar = req.query.lugar || '';
    const categoria = req.query.categoria || '';

    const recommendations = await getRecommendation(lugar, categoria);
    res.send({
      status: 'OK',
      data: recommendations,
    });
  } catch (e) {
    next(e);
  }
};

//Eleminar tu propia recomendación
const deleteRecommendationController = async (req, res, next) => {
  try {
    //req.userId
    const { id } = req.params;

    //Conseguir la información del tweet que quiero borrar
    const recommendation = await getRecommendationById(id);

    //Comprobar que el usuario del token es el mismo que creó l tweet
    if (req.userId !== recommendation.user_id) {
      throw generateError(
        'No puedes borrar una recomendación que no te pertenece',
        401
      );
    }

    //Borrar el tweet
    await deleteRecommendationById(id);

    res.send({
      status: 'OK',
      message: 'Recommendation Eliminado Correctamente',
    });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  newRecommendationController,
  listaRecommendationsController,
  getRecommendationController,
  getRecommendationByLugarAndCategory,
  deleteRecommendationController,
};
