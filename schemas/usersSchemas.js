const Joi = require('joi');

const userSchema = Joi.object({
  username: Joi.string().required(),
  name: Joi.string().required(),
  lastname: Joi.string().required(),
  address: Joi.string().required(),
  gender: Joi.string().valid('male', 'female', 'other').lowercase().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  profile_image: Joi.string().allow(null),
  bio: Joi.string().allow(null),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email address is required',
  }),
  password: Joi.string().min(8).max(50).required().messages({
    'string.min': 'Password must be at least {#limit} characters long',
    'string.max': 'Password must not exceed {#limit} characters long',
    'any.required': 'Password is required',
  }),
});

const updateUserSchema = Joi.object({
  username: Joi.string(),
  name: Joi.string(),
  lastname: Joi.string(),
  address: Joi.string(),
  gender: Joi.string().valid('male', 'female', 'other').lowercase(),
  email: Joi.string().email(),
  profile_image: Joi.string().allow(null).empty(false),
  bio: Joi.string().allow(null).empty(false),
});

const getUserSchema = Joi.object({
  id: Joi.string().required(),
});

module.exports = {
  userSchema,
  loginSchema,
  updateUserSchema,
  getUserSchema,
};
