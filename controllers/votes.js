const { generateError } = require('../helper');

const { getRecommendationById } = require('../db/recommendations');

const { createVotes } = require('../db/votes');

const newVotationController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const recommendation = await getRecommendationById(id);

    //Comprobar que el usuario del token es el mismo que creó l tweet
    if (req.userId === recommendation.user_id) {
      throw generateError(
        'No puedes votar una recomendación que has creado tu mismo',
        401
      );
    }

    //Añadir una votación en una recomendación
    await createVotes(req.userId, recommendation.id);
    res.send({
      status: 'OK',
      message: 'La votación ha sido creada correctamente',
    });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  newVotationController,
};
