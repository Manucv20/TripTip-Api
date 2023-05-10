const generateError = (message, status) => {
  const error = new error(message);
  error.httpStatus = status;
  return error;
};

module.exports = {
  generateError,
};
