const Joi = require('joi');

const newCommentSchema = Joi.object({
  user_id: Joi.number().integer().required(),
  recommendation_id: Joi.number().integer().required(),
  comment: Joi.string().required(),
  image: Joi.object().allow(null, '').optional(),
});

const idCommentsSchema = Joi.object({
  id: Joi.number().integer().required(),
});

module.exports = {
  newCommentSchema,
  idCommentsSchema,
};