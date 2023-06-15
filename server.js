require("dotenv").config();
const expressFileUpload = require("express-fileupload");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();

const userRoutes = require("./routes/users");
const recommendationRoutes = require("./routes/recommendations");
const votesRoutes = require("./routes/votes");
const commentsRoutes = require("./routes/comments");
const sendEmailRoutes = require("./routes/email");

app.use(cors());
app.use(expressFileUpload());
app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static("./uploads"));

//RUTAS
app.use("/", userRoutes);
app.use("/", recommendationRoutes);
app.use("/", votesRoutes);
app.use("/", commentsRoutes);
app.use("/", sendEmailRoutes);

//Middleware para el error 404
app.use((req, res) => {
  res.status(404).send({
    status: "Error",
    message: "Página no encontrada",
  });
});

//Middleware de gestión de errores personalizados
app.use((error, req, res, next) => {
  console.error(error);

  res.status(error.httpStatus || 500).send({
    status: "Error",
    message: error.message,
  });
});

// Start server
app.listen(process.env.APP_PORT, () => {
  console.log(`Server listening on port ${process.env.APP_PORT}`);
});
