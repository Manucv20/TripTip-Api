require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');

const {
  newUserController,
  createProfileUser,
  loginController,
  getUserController,
} = require('./controllers/users');

const {
  newRecommendationController,
  listaRecommendationsController,
  getRecommendationController,
  getRecommendationByLugarAndCategory,
  deleteRecommendationController,
} = require('./controllers/recommendations');

const { newVotationController } = require('./controllers/votes');

const { authUser } = require('./middleware/auth');

const app = express();

app.use(fileUpload());
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static('./uploads'));

//Ruta para usuarios
app.post('/register', newUserController);
app.post('/profile', authUser, createProfileUser);
app.post('/login', loginController);
app.get('/:username', getUserController);

//Ruta recomendaciones
app.post('/recommendations', authUser, newRecommendationController);
app.get('/', listaRecommendationsController);
app.get('/recommendation/:id', getRecommendationController);
app.get('/recommendations/search', getRecommendationByLugarAndCategory);
app.delete('/recommendation/:id', authUser, deleteRecommendationController);

//Ruta votaciones
app.post('/recommendation/:id', authUser, newVotationController);

//Middleware para el error 404
app.use((req, res) => {
  res.status(404).send({
    status: 'Error',
    message: 'Página no encontrada',
  });
});

//Middleware de gestión de errores personalizados
app.use((error, req, res, next) => {
  console.error(error);

  res.status(error.httpStatus || 500).send({
    status: 'Error',
    message: error.message,
  });
});

//lanzamos el status
app.listen(process.env.APP_PORT, () => {
  console.log('Servidor Funcionando! 👌');
});
