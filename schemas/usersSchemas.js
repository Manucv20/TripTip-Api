const Joi = require('joi');

const userSchema = Joi.object({
  username: Joi.string().required(),
  name: Joi.string().required(),
  lastname: Joi.string().required(),
  address: Joi.string().required(),
  gender: Joi.string().valid('male', 'female', 'other').lowercase().required(),
  email: Joi.string().email().required(),
  profile_image: Joi.string().allow(null),
  bio: Joi.string().allow(null),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const newUserSchema = userSchema.keys({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const updateUserSchema = userSchema.keys({
  profile_image: Joi.string().optional(),
  bio: Joi.string().optional(),
});

const getUserSchema = Joi.object({
  id: Joi.number().integer().required(),
});

module.exports = {
  userSchema,
  loginSchema,
  newUserSchema,
  updateUserSchema,
  getUserSchema,
};
