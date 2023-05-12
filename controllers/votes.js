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
    console.log(req.userId);
    const { id } = req.params;
    const recommendation = await getRecommendationById(id);

    //Añadir una votación en una recomendación
    await createVotes(req.userId, recommendation[0].result.id);
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
