const { createVotes } = require("../db/votes");
const { getRecommendationById } = require("../db/recommendations");

const NewVoteController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const recommendation = await getRecommendationById(id);

    //Añadir una votación en una recomendación
    const data = await createVotes(req.userId, recommendation[0].result.id);

    if (data) {
      message = "¡Excelente elección! Te ha gustado la recomendación.";
    } else {
      message = `¿Cambiaste de opinión? Has quitado tu "me gusta" de la recomendación.`;
    }

    res.send({
      status: "OK",
      message,
    });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  NewVoteController,
};
