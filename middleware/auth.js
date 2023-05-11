const { generateError } = require('../helper');
const jwt = require('jsonwebtoken');

const authUser = (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      throw generateError(
        'Tienes que logearte para poder realizar esa operación',
        401
      );
    }

    //Comprobamos que el token sea correcto
    let token;

    try {
      token = jwt.verify(authorization, process.env.SECRET);
    } catch (e) {
      throw generateError('Token incorrecto', 401);
    }

    //Metemos la informacion del token en la request para usarla en el controlador
    req.userId = token.id;
    //Saltamos al controlador

    next();
  } catch (e) {
    next(e);
  }
};

module.exports = { authUser };
