const { generateError, createPathIfNotExists } = require('../helpers');
const {
  newRecommendationSchema,
  idRecommendationSchema,
  getRecommendationsByLocationAndCategorySchema,
} = require('../schemas/recommendationsSchemas');
const {
  createRecommendation,
  getRecommendation,
  getRecommendationById,
  deleteRecommendationById,
  recommendationOrderedByVotes,
  recommendationByUser,
} = require('../db/recommendations');

const path = require('path');
const sharp = require('sharp');
const crypto = require('crypto');

// Genera un nombre aleatorio de N caracteres para la imagen
const randomName = (n) => crypto.randomBytes(n).toString('hex');

const newRecommendationController = async (req, res, next) => {
  try {
    const { error } = newRecommendationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { title, category, location, summary, details } = req.body;

    let imageFileName;

    if (req.files?.image) {
      //Creo el path del directorio uploads
      const uploadsDir = path.join(__dirname, '../uploads/recommendationImage');
      //Creo el directorio si no existe
      await createPathIfNotExists(uploadsDir);
      //Procesar la imagen
      const image = sharp(req.files.image.data);
      //verifico que el archivo contenga las extensiones jpg o png
      const fileName = req.files.image.name;
      if (fileName.endsWith('.jpg') || fileName.endsWith('.png')) {
        image.resize(256);
      } else {
        throw generateError(
          'You must enter an image with jpg or png extension',
          400
        );
      }
      //Guardo la imagen con un nombre aleatorio en el directorio uploads
      imageFileName = `${randomName(16)}.jpg`;

      await image.toFile(path.join(uploadsDir, imageFileName));
    }

    const query = await createRecommendation(
      req.userId,
      title,
      category,
      location,
      summary,
      details,
      imageFileName
    );

    res.status(200).json({
      message: 'Recommendation created successfully',
      recommendation_id: query.insertId,
    });
  } catch (err) {
    next(err);
  }
};

const deleteRecommendationController = async (req, res, next) => {
  try {
    const { error } = idRecommendationSchema.validate(req.params);
    if (error) {
      throw new Error(error.details[0].message);
    }
    const { id } = req.params;

    const deleteQuery = await getRecommendationById(id);

    if (req.userId !== deleteQuery.user_id) {
      throw generateError(
        'You cant delete a recommendation that doesnt belong to you',
        401
      );
    }

    await deleteRecommendationById(id);

    res.status(200).json({ message: 'Recommendation deleted successfully' });
  } catch (err) {
    console.log(err);
    throw generateError('Recommendation didnt delete successfully', 500);
  }
};

const getRecommendationController = async (req, res, next) => {
  try {
    /*const { error, value } = idRecommendationSchema.validate(req.params);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }*/
    const { id } = req.params;
    const recommendations = await getRecommendationById(id);

    if (recommendations.length === 0) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }
    const recommendation = recommendations[0];

    res.status(200).json({ recommendation });
  } catch (err) {
    console.log(err);
    throw generateError('Recommendation not found', 404);
  }
};

const getRecommendationsByLocationAndCategoryController = async (
  req,
  res,
  next
) => {
  try {
    const localization = req.query.localization || '';
    const category = req.query.category || '';

    const recommendations = await getRecommendation(localization, category);
    res.send({
      status: 'OK',
      data: recommendations,
    });
  } catch (err) {
    console.log(err);
    throw generateError('dont exist', 404);
  }
};

const getRecommendationOrderedByVotesController = async (req, res, next) => {
  try {
    const query = await recommendationOrderedByVotes();

    const [rows] = await connection.query(query);

    res.status(200).json({ recommendations: rows });
  } catch (err) {
    throw generateError('server error', 500);
  }
};

const getRecommendationByUserController = async (req, res, next) => {
  try {
    const { error } = idRecommendationSchema.validate(req.params);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const userId = req.params.id;

    const query = await recommendationByUser(userId);

    res.status(200).json({ recommendations: query });
  } catch (err) {
    console.log(err);
    throw generateError('this user doesnt have recommendations', 500);
  }
};

module.exports = {
  newRecommendationController,
  deleteRecommendationController,
  getRecommendationController,
  getRecommendationsByLocationAndCategoryController,
  getRecommendationOrderedByVotesController,
  getRecommendationByUserController,
};
