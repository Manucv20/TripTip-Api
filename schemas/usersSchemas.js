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
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email address is required',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least {#limit} characters long',
    'any.required': 'Password is required',
  }),
});

const updateUserSchema = Joi.object({
  profile_image: Joi.string().allow(null),
  bio: Joi.string().allow(null),
}).concat(userSchema);

const getUserSchema = Joi.object({
  id: Joi.string().required().messages({
    'string.base': 'User ID must be a string',
    'any.required': 'User ID is required',
  }),
});

module.exports = {
  userSchema,
  loginSchema,
  updateUserSchema,
  getUserSchema,
};
