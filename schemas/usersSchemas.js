const Joi = require("joi");

const userSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  name: Joi.string().min(2).max(30).allow(""),
  lastname: Joi.string().min(2).max(30),
  address: Joi.string().max(100).allow(""),
  gender: Joi.string().valid("male", "female", "other").lowercase(),
  email: Joi.string().email().max(100).required(),
  password: Joi.string().min(8).required(),
  profile_image: Joi.string().max(100).allow(""),
  bio: Joi.string().max(500).allow(""),
});

const loginSchema = Joi.object({
  email: Joi.string().email().max(100).required(),
  password: Joi.string().min(8).max(50).required().messages(),
});

const updateUserSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  name: Joi.string().min(2).max(30).allow(""),
  lastname: Joi.string().min(2).max(30),
  address: Joi.string().max(100).allow(""),
  gender: Joi.string().valid("male", "female", "other").lowercase(),
  email: Joi.string().email().max(100).required(),
  password: Joi.string().min(8).required(),
  profile_image: Joi.string().max(100).allow(""),
  bio: Joi.string().max(500).allow(""),
});

const getUserSchema = Joi.object({
  id: Joi.string().required(),
});

const getEmailSchema = Joi.object({
  email: Joi.string().email().max(100).required(),
});

const getPasswordSchema = Joi.object({
  password: Joi.string().min(8).required(),
});

module.exports = {
  userSchema,
  loginSchema,
  updateUserSchema,
  getUserSchema,
  getEmailSchema,
  getPasswordSchema,
};
