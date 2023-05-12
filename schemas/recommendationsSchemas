const Joi = require('joi');

const newRecommendationSchema = Joi.object({
  title: Joi.string().required(),
  category: Joi.string().required(),
  location: Joi.string().required(),
  summary: Joi.string().required(),
  details: Joi.string().required(),
});

const idRecommendationSchema = Joi.object({
  id: Joi.number().integer().required(),
});

const getRecommendationsByLocationAndCategorySchema = Joi.object({
  location: Joi.string().allow(''),
  category: Joi.string().allow(''),
});

module.exports = {
  newRecommendationSchema,
  idRecommendationSchema,
  getRecommendationsByLocationAndCategorySchema,
};
