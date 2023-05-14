const Joi = require('joi');

const newCommentSchema = Joi.object({
  comment: Joi.string().required(),
});

const idCommentsSchema = Joi.object({
  id: Joi.number().integer().required(),
});

module.exports = {
  newCommentSchema,
  idCommentsSchema,
};
