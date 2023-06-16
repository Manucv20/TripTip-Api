const { generateError } = require("../helpers");
const jwt = require("jsonwebtoken");

const authUser = (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      throw generateError(
        "Unauthorized. You need to be a registered user to perform this action.",
        401
      );
    }
    let token;
    try {
      token = jwt.verify(authorization, process.env.JWT_SECRET);
    } catch {
      throw generateError(
        "Token expired. Please log in again to continue.",
        401
      );
    }

    req.userId = token.userId;
    req.userEmail = token.userEmail;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { authUser };
