const express = require('express');
const router = express.Router();
const {
  newRecommendationController,
  deleteRecommendationController,
  getRecommendationController,
  getRecommendationOrderedByVotesController,
  getRecommendationsByLocationAndCategoryController,
  getRecommendationByUserController,
  updateRecommendationController,
} = require('../controllers/recommendations');
const { authUser } = require('../middlewares/auth');

// Crear nueva recomendación
router.post('/recommendations/', authUser, newRecommendationController);

// Borrar recomendación
router.delete('/recommendations/:id', authUser, deleteRecommendationController);

// Obtener todas las recomendaciones por localización o categoría
router.get(
  '/recommendations',
  getRecommendationsByLocationAndCategoryController
);

// Obtener recomendación por ID
router.get('/recommendation/:id', getRecommendationController);

// Obtener recomendaciones ordenadas por votos
router.get(
  '/recommendations/orderedByVotes',
  getRecommendationOrderedByVotesController
);

// Obtener recomendaciones de un usuario
router.get('/users/:id/recommendations', getRecommendationByUserController);

// Actualizar recomendación hecha
router.put('/recommendations/:id', authUser, updateRecommendationController);

module.exports = router;
