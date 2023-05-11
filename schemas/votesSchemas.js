const Joi = require('joi');

const newVoteSchema = Joi.object({
  user_id: Joi.number().integer().required(),
  recommendation_id: Joi.number().integer().required(),
  value: Joi.number().valid(1, 0).required(),
});

module.exports = {
  newVoteSchema}
