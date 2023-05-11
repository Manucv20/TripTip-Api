const Joi = require('joi');

const newCommentSchema = Joi.object({
  user_id: Joi.number().integer().required(),
  recommendation_id: Joi.number().integer().required(),
  comment: Joi.string().required(),
});

const idCommentsSchema = Joi.object({
  id: Joi.number().integer().required(),
});

module.exports = {
  newCommentSchema,
  idCommentsSchema,
};
