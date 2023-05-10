require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const app = express();
const expressFileUpload = require('express-fileupload');
const {
  newUserController,
  loginController,
  updateUserController,
  getUserController,
} = require('./controllers/users');
const {
  newRecommendationController,
  deleteRecommendationController,
  getRecommendationController,
  getRecommendationOrderedByVotesController,
  getRecommendationsByLocationAndCategoryController,
  getRecommendationByUserController,
} = require('./controllers/recommendations');
const {
  newCommentController,
  getCommentsByRecommendationsController,
  deleteCommentsByUserController,
} = require('./controllers/comments');
const { NewVoteController } = require('./controllers/votes');

app.use(morgan('dev'));
app.use(expressFileUpload());
app.use(express.json());
app.use('/uploads', express.static('./uploads'));

//RUTAS

//Middleware de 404

app.use((req, res) => {
  res.status(404).send({
    status: 'error',
    message: 'Not found',
  });
}); 

//Middlware de gestión de errores
app.use((error, req, res, next) => {
  console.error(error);

  res.status(error.httpStatus || 500).send({
    status: 'error',
    message: error.message,
  });
});

//////////////////////////USUARIOS

//REGISTRAR USUARIOS

app.post('/user/register', newUserController);

//LOGIN USUARIOS
app.post('/user/login', loginController);

// ACTUALIZAR USUARIO
app.put('/user/:id', updateUserController);

// OBTENER USUARIO POR ID
app.get('/user/:id', getUserController);

////////////////////////RECOMENDACIONES

//POSTEAR RECOMENDACION

app.post('/recommendations', newRecommendationController);

//BORRAR RECOMENDACIÓN
app.delete('/recommendations/:id', deleteRecommendationController);

//OBTENER TODAS LAS RECOMENDACION POR LOCALIZACION O CATEGORIA

app.get('/recommendations', getRecommendationsByLocationAndCategoryController);

//OBTENER LAS RECOMENDACION POR ID
app.get('/recommendations/:id', getRecommendationController);

// OBTENER RECOMENDACIONES ORDENADAS POR VOTOS
app.get(
  '/recommendations/orderedByVotes',
  getRecommendationOrderedByVotesController
);

// OBTENER RECOMENDACIÓN POR ID DEL USUARIO
app.get('/users/:id/recommendations', getRecommendationByUserController);

///////////////////////VOTOS

//CREAR UN NUEVO VOTO
app.post('/votes', NewVoteController);

//////////////////////COMENTARIOS

// POSTEAR COMENTARIO EN UNA RECOMENDACIÓN
app.post('/recommendations/:id/comments', newCommentController);

// OBTENER COMENTARIOS POR ID DE LA RECOMENDACIÓN
app.get(
  '/recommendations/:id/comments',
  getCommentsByRecommendationsController
);

// BORRAR COMENTARIO POR ID
app.delete('/comments/:id', deleteCommentsByUserController);

// Start server
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
