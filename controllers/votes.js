const { createVotes, getVotedRecommendationsByUser, deleteVoteByUserAndRecommendation } = require("../db/votes");
const { getRecommendationById } = require("../db/recommendations");

const NewVoteController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const recommendation = await getRecommendationById(id);

    // Añadir una votación en una recomendación
    const { success, votes } = await createVotes(
      req.userId,
      recommendation[0].result.id
    );

    let message;
    if (success) {
      message = "¡Excelente elección! Te ha gustado la recomendación.";
    } else {
      message = '¿Cambiaste de opinión? Has quitado tu "me gusta" de la recomendación.';
    }

    res.send({
      status: "OK",
      message,
      votes,
    });
  } catch (e) {
    next(e);
  }
};

const getVotedRecommendationsController = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    const votedRecommendations = await getVotedRecommendationsByUser(user_id);

    res.status(200).json(votedRecommendations);
  } catch (e) {
    next(e);
  }
};

const deleteVoteController = async (req, res, next) => {
  try {
    const { user_id, recommendation_id } = req.params;

    // Eliminar el voto del usuario para la recomendación específica
    await deleteVoteByUserAndRecommendation(user_id, recommendation_id);

    res.send({
      status: "OK",
      message: "El voto ha sido eliminado correctamente.",
    });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  getVotedRecommendationsController,
  NewVoteController,
  deleteVoteController,
};
