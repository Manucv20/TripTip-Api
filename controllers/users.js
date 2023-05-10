const { getConnection } = require('../db/db.js');
const { generateError } = require('../helpers');
const Joi = require('joi');
const {
  newUserSchema,
  updateUserSchema,
  getUserSchema,
  userSchema,
} = require('../schemas/usersSchemas');
const { createUser, login, updateUser, getUserById } = require('../db/users');
const newUserController = async (req, res) => {
  try {
    const { error, value } = newUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const {name, lastname,address,gender,email,password, profile_image, bio,} = req.body;
    const insertId = await createUser({name, lastname, address, gender, email, password, profile_image, bio,
    });
    res.status(200).json({ message: 'User registered successfully', userId: insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const loginController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    const token = await login(email, password);

    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: err.message });
  }
};

const updateUserController = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Validar datos de entrada
    const { error, value } = updateUserSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { name, lastname, address, gender, email, profile_image, bio } =
      value;

    await updateUser(userId, {
      name,
      lastname,
      address,
      gender,
      email,
      profile_image,
      bio,
    });

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
const getUserController = async (req, res, next) => {
  try {
    const { error, value } = getUserSchema.validate(req.params);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const user_id = req.params.id;
    const user = await getUserById(user_id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  newUserController,
  loginController,
  updateUserController,
  getUserController,
};
