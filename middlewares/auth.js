const { generateError } = require("../helpers");
const jwt = require("jsonwebtoken");

const authUser = (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      throw generateError(
        "No autorizado. Debes ser un usuario registrado para realizar esta acción.",
        401
      );
    }
    let token;
    try {
      token = jwt.verify(authorization, process.env.JWT_SECRET);
    } catch {
      throw generateError(
        "Token expirado. Por favor, inicia sesión nuevamente para continuar..",
        401
      );
    }

    req.userId = token.userId;
    req.userEmail = token.userEmail;
    req.firstName = token.firstName;
    req.lastName = token.lastName;
    req.userUsername = token.userUsername;
    req.imagen = token.imagen;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { authUser };
