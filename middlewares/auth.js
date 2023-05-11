const { generateError } = require('../helpers');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const authUser = (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      throw generateError('no authorization header', 401);
    }
    let token;
    try {
      token = jwt.verify(authorization, process.env.JWT_SECRET);
    } catch {
      throw generateError('Invalid token', 401);
    }
    req.auth = token;
    req.userId = token.userId;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { authUser };
