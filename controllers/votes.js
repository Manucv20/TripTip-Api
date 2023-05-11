const { generateError } = require('../helpers');
const { newVoteSchema } = require('../schemas/votesSchemas');
const { createVotes } = require('../db/votes');
const { getRecommendationById } = require('../db/recommendations');

const NewVoteController = async (req, res, next) => {
  try {
    const { error, value } = newVoteSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { id } = req.params;
    const recommendation = await getRecommendationById(id);
    console.log(req.userId);
    //Comprobar que el usuario del token es el mismo que creó l tweet
    if (req.userId === recommendation.user_id) {
      throw generateError(
        'You cannot vote on a recommendation that you have created yourself',
        401
      );
    }

    //Añadir una votación en una recomendación
    await createVotes(req.userId, recommendation.id);
    res.send({
      status: 'OK',
      message: 'Vote created successfully',
    });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  NewVoteController,
};
