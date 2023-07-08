const express = require('express');
const router = express.Router();
const {
  newCommentController,
  getCommentsByRecommendationsController,
  deleteCommentsByUserController,
} = require('../controllers/comments');
const { authUser } = require('../middlewares/auth');

// Crear un nuevo comentario en una recomendación
router.post('/recommendations/comments/:id', authUser, newCommentController);

// Obtener comentarios por ID de recomendación
router.get(
  '/recommendations/:id/comments',
  getCommentsByRecommendationsController
);

// Borrar comentario por ID
router.delete('/comments/:id', authUser, deleteCommentsByUserController);

module.exports = router;
