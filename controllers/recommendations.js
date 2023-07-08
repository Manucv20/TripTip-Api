const { generateError, createPathIfNotExists } = require("../helpers");
const {
  newRecommendationSchema,
  idRecommendationSchema,
} = require("../schemas/recommendationsSchemas");
const {
  createRecommendation,
  getRecommendation,
  getRecommendationById,
  deleteRecommendationById,
  recommendationOrderedByVotes,
  recommendationByUser,
  updateRecommendation,
} = require("../db/recommendations");

const path = require("path");
const sharp = require("sharp");
const crypto = require("crypto");

// Genera un nombre aleatorio de N caracteres para la imagen
const randomName = (n) => crypto.randomBytes(n).toString("hex");

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
      const uploadsDir = path.join(__dirname, "../uploads");
      //Creo el directorio si no existe
      await createPathIfNotExists(uploadsDir);
      //Procesar la imagen
      const image = sharp(req.files.image.data);
      //verifico que el archivo contenga las extensiones jpg o png
      const fileName = req.files.image.name;
      if (
        fileName.endsWith(".jpg") ||
        fileName.endsWith(".png") ||
        fileName.endsWith(".jpeg")
      ) {
        image.resize(1024);
      } else {
        throw generateError(
          "Por favor, asegúrate de subir una imagen en formato jpg, png o jpeg.",
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
      message: "Recomendación creada exitosamente.",
      recommendation_id: query,
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

    const [deleteQuery] = await getRecommendationById(id);

    if (Number(req.userId) !== deleteQuery.result.user_id) {
      throw generateError(
        "No puedes eliminar una recomendación que no te pertenece.",
        401
      );
    }

    await deleteRecommendationById(id);

    res.status(200).json({ message: "Recomendación eliminada exitosamente." });
  } catch (err) {
    next(err);
  }
};

const getRecommendationController = async (req, res, next) => {
  try {
    const { error, value } = idRecommendationSchema.validate(req.params);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { id } = value;
    const recommendations = await getRecommendationById(id);

    if (recommendations.length === 0) {
      throw generateError("Recomendación no encontrada.", 404);
    }

    const recommendation = recommendations[0];

    res.status(200).json({ recommendation });
  } catch (err) {
    next(err);
  }
};

const getRecommendationsByLocationAndCategoryController = async (
  req,
  res,
  next
) => {
  try {
    const localization = req.query.location || "";
    const category = req.query.category || "";
    const recommendations = await getRecommendation(localization, category);

    res.send({
      status: "OK",
      data: recommendations,
    });
  } catch (err) {
    next(err);
  }
};

const getRecommendationOrderedByVotesController = async (req, res, next) => {
  try {
    const query = await recommendationOrderedByVotes();

    res.status(200).json({ recommendations: query });
  } catch (err) {
    next(err);
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
    next(err);
  }
};

const updateRecommendationController = async (req, res, next) => {
  try {
    const { error, value } = newRecommendationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { title, category, location, summary, details } = value;
    const { id } = req.params;

    const [updateQuery] = await getRecommendationById(id);

    if (Number(req.userId) !== updateQuery.result.user_id) {
      throw generateError(
        "No puedes eliminar una recomendación que no te pertenece.",
        401
      );
    }

    let imageFileName;

    if (req.files?.image) {
      //Creo el path del directorio uploads
      const uploadsDir = path.join(__dirname, "../uploads");
      //Creo el directorio si no existe
      await createPathIfNotExists(uploadsDir);
      //Procesar la imagen
      const image = sharp(req.files.image.data);
      //verifico que el archivo contenga las extensiones jpg o png
      const fileName = req.files.image.name;
      if (
        fileName.endsWith(".jpg") ||
        fileName.endsWith(".png") ||
        fileName.endsWith(".jpeg")
      ) {
        image.resize(1024);
      } else {
        throw generateError(
          "Por favor, asegúrate de subir una imagen en formato jpg, png o jpeg.",
          400
        );
      }
      //Guardo la imagen con un nombre aleatorio en el directorio uploads
      imageFileName = `${randomName(16)}.jpg`;

      await image.toFile(path.join(uploadsDir, imageFileName));
    }

    const query = await updateRecommendation(
      req.userId,
      title,
      category,
      location,
      summary,
      details,
      imageFileName,
      id
    );

    res.status(200).json({
      message: "Recomendación actualizada exitosamente.",
      recommendation_id: query.insertId,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  newRecommendationController,
  deleteRecommendationController,
  getRecommendationController,
  getRecommendationsByLocationAndCategoryController,
  getRecommendationOrderedByVotesController,
  getRecommendationByUserController,
  updateRecommendationController,
};
