const { createVotes } = require('../db/votes');
const { getRecommendationById } = require('../db/recommendations');

const NewVoteController = async (req, res, next) => {
  try {
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
