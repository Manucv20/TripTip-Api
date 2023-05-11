const { generateError, createPathIfNotExists } = require('../helper');

const {
  createUser,
  createProfile,
  getUserByEmail,
  getUserByUsername,
} = require('../db/users');

const Joi = require('joi');
const path = require('path');
const sharp = require('sharp');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Genera un nombre aleatorio de N caracteres para la imagen
const randomName = (n) => crypto.randomBytes(n).toString('hex');

//Crea un nuevo registro de usuario
const newUserController = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    //Plantilla para el registro
    const userSchema = Joi.object().keys({
      username: Joi.string().max(50).required(),
      email: Joi.string().max(255).email().required(),
      password: Joi.string().max(255).required(),
    });

    const validation = userSchema.validate(req.body);

    if (validation.error) {
      throw generateError(
        'Debes introducir los valores requeridos correctamente',
        400
      );
    }

    const id = await createUser(username, email, password);

    res.send({
      status: 'OK',
      message: `User created with id: ${id}`,
    });
  } catch (e) {
    next(e);
  }
};

//Rellena los campos de perfil del usuario incluido la imagen
const createProfileUser = async (req, res, next) => {
  try {
    const { name, lastname, address, gender, bio } = req.body;

    //Plantilla para el registro
    const userSchema = Joi.object().keys({
      name: Joi.string().max(50),
      lastname: Joi.string().max(50),
      address: Joi.string().max(250),
      gender: Joi.string().max(10),
      bio: Joi.string().max(512),
    });

    const validation = userSchema.validate(req.body);

    if (validation.error) {
      throw generateError(
        'Debes introducir los valores requeridos correctamente',
        400
      );
    }

    let imageFileName;

    if (req.files?.image) {
      //Creo el path del directorio uploads
      const uploadsDir = path.join(__dirname, '../uploads');
      //Creo el directorio si no existe
      await createPathIfNotExists(uploadsDir);
      //Procesar la imagen
      const image = sharp(req.files.image.data);
      image.resize(256);
      //Guardo la imagen con un nombre aleatorio en el directorio uploads
      imageFileName = `${randomName(16)}.jpg`;

      await image.toFile(path.join(uploadsDir, imageFileName));
    }

    const profile = await createProfile(
      req.userId,
      name,
      lastname,
      address,
      gender,
      imageFileName,
      bio
    );

    res.send({
      status: 'OK',
      data: profile,
    });
  } catch (e) {
    next(e);
  }
};

//Login de usuario
const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //Plantilla para el login
    const userSchema = Joi.object().keys({
      email: Joi.string().max(255).email().required(),
      password: Joi.string().max(255).required(),
    });

    const validation = userSchema.validate(req.body);

    if (validation.error) {
      throw generateError(
        'Debes introducir los valores requeridos correctamente',
        400
      );
    }

    //Recojo los datos de la base de adatos del usuario con ese email
    const user = await getUserByEmail(email);
    //Compruebo que las contraseñas coinciden
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      throw generateError('La contraseña no coincide', 401);
    }

    //Creo el payloado del token
    const payload = { id: user.id };

    //Firma el token
    const token = jwt.sign(payload, process.env.SECRET, {
      expiresIn: '30d',
    });

    //Envio el token

    res.send({
      status: 'OK',
      data: token,
    });
  } catch (e) {
    next(e);
  }
};

const getUserController = async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await getUserByUsername(username);

    res.send({
      status: 'OK',
      data: user,
    });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  newUserController,
  createProfileUser,
  loginController,
  getUserController,
};
