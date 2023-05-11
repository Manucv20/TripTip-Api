require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const app = express();
const expressFileUpload = require('express-fileupload');
const userRoutes = require('./routes/users');
const recommendationRoutes = require('./routes/recommendations');
const votesRoutes = require('./routes/votes');
const commentsRoutes = require('./routes/comments');
app.use(morgan('dev'));
app.use(expressFileUpload());
app.use(express.json());
app.use('/uploads', express.static('./uploads'));

//RUTAS
app.use('/', userRoutes);
app.use('/', recommendationRoutes);
app.use('/', votesRoutes);
app.use('/', commentsRoutes);

//Middlware de gestión de errores
/*app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message
    }
  });
});*/
// Start server
app.listen(process.env.DB_PORT, () => {
  console.log(`Server listening on port ${process.env.DB_PORT}`);
});
