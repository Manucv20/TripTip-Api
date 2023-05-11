const { validationResult } = require('express-validator');
const { generateError, createPathIfNotExists } = require('../helpers');
const {
  newUserSchema,
  loginSchema,
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
    const { username, name, lastname, address, gender, email, password, bio } =
      req.body;
      
      let imageFileName;
      
      if (req.files?.profile_image) {
        //Creo el path del directorio uploads
        console.log("Paso el if");
        const uploadsDir = path.join(__dirname, '../uploads/profileImage');
        //Creo el directorio si no existe
        await createPathIfNotExists(uploadsDir);
        //Procesar la imagen
        const image = sharp(req.files.image.data);
        image.resize(256);
        //Guardo la imagen con un nombre aleatorio en el directorio uploads
        const { default: nanoid } = await import('nanoid');
        imageFileName = `${nanoid(20).jpg}`;
        await image.toFile(path.join(uploadsDir, imageFileName));
      }
      
      const insertId = await createUser({
      username,
      name,
      lastname,
      address,
      gender,
      email,
      password,
      imageFileName,
      bio,
    });
      res
      .status(200)
      .json({ message: 'User registered successfully', userId: insertId });
  } catch (err) {
    throw generateError('the user has not been created', 401);
    console.log(err);
  }
};

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
    throw generateError('the profile has not been updated', 500);
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
    throw generateError('User not found', 500);
  }
};

module.exports = {
  newUserController,
  loginController,
  updateUserController,
  getUserController,
};
