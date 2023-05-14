const { validationResult } = require('express-validator');
const { generateError, createPathIfNotExists } = require('../helpers');
const path = require('path');
const sharp = require('sharp');
const crypto = require('crypto');

const {
  userSchema,
  loginSchema,
  updateUserSchema,
  getUserSchema,
} = require('../schemas/usersSchemas');

const {
  createUser,
  login,
  updateUser,
  getUserById,
  getUserByUsername,
} = require('../db/users');

// Genera un nombre aleatorio de N caracteres para la imagen
const randomName = (n) => crypto.randomBytes(n).toString('hex');

const validateNewUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const createNewUser = async (req, res, next) => {
  try {
    const { username, name, lastname, address, gender, email, password, bio } =
      req.body;
    const insertId = await createUser({
      username,
      name,
      lastname,
      address,
      gender,
      email,
      password,
      bio,
    });
    res
      .status(200)
      .json({ message: 'User registered successfully', userId: insertId });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: 'An error occurred while creating the user' });
  }
};

const newUserController = [validateNewUser, createNewUser];

const loginController = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    const token = await login(email, password);

    res.status(200).json({ token });
  } catch (err) {
    throw generateError('Invalid email or password', 404);
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

    const { name, lastname, address, gender, email, bio } = value;

    let imageFileName;

    if (req.files?.profile_image) {
      //Creo el path del directorio uploads
      const uploadsDir = path.join(__dirname, '../uploads');
      const profileImageDir = path.join(__dirname, '../uploads/profileImage');
      //Creo el directorio si no existe
      await createPathIfNotExists(uploadsDir);
      await createPathIfNotExists(profileImageDir);
      //Procesar la imagen
      const image = sharp(req.files.profile_image.data);
      //verifico que el archivo contenga las extensiones jpg o png
      const fileName = req.files.profile_image.name;
      if (fileName.endsWith('.jpg') || fileName.endsWith('.png')) {
        image.resize(256);
      } else {
        throw generateError(
          'You must enter an image with jpg or png extension',
          400
        );
      }
      //Guardo la imagen con un nombre aleatorio en el directorio uploads
      imageFileName = `${randomName(16)}.jpg`;

      await image.toFile(path.join(uploadsDir, imageFileName));
    }

    await updateUser(
      userId,
      name,
      lastname,
      address,
      gender,
      email,
      imageFileName,
      bio
    );

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (err) {
    next(err);
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
      throw generateError('User not found', 404, { userId: user_id });
    }

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  newUserController,
  loginController,
  updateUserController,
  getUserController,
};
