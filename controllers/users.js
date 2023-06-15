const { generateError, createPathIfNotExists } = require("../helpers");
const path = require("path");
const sharp = require("sharp");
const crypto = require("crypto");

const {
  userSchema,
  loginSchema,
  updateUserSchema,
  getUserSchema,
} = require("../schemas/usersSchemas");

const {
  createUser,
  login,
  updateUser,
  getUserById,
  getUserByEmail,
} = require("../db/users");

const { sendActivationEmail } = require("./email");
const { createEmailVerification } = require("../db/email");
const { v4: uuidv4 } = require("uuid");

const generateActivationToken = () => {
  return uuidv4();
};

// Genera un nombre aleatorio de N caracteres para la imagen
const randomName = (n) => crypto.randomBytes(n).toString("hex");

const validateNewUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body);

  if (error) {
    throw generateError(error.details[0].message, 400);
  }
  next();
};

const createNewUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const token = generateActivationToken();

    const userId = await createUser({
      username,
      email,
      password,
    });

    await createEmailVerification({ userId, token });

    await sendActivationEmail(username, email, token);

    res.status(200).json({ message: "User registered successfully", userId });
  } catch (err) {
    next(err);
  }
};

const newUserController = [validateNewUser, createNewUser];

const loginController = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);

    if (error) {
      throw generateError(error.details[0].message, 404);
    }

    const { email, password } = value;

    const user = await getUserByEmail(email);

    if (!user) {
      throw generateError("Invalid email or password", 401);
    }

    if (!user.isActivated) {
      throw generateError(
        "Account not activated. Please activate your account first.",
        403
      );
    }

    const token = await login(email, password);

    res.status(200).json({ token });
  } catch (err) {
    next(err);
  }
};

const updateUserController = async (req, res, next) => {
  try {
    const userId = req.params.id;
    console.log(req.userId);

    // Validar datos de entrada
    const { error, value } = updateUserSchema.validate(req.body);

    if (error) {
      throw generateError(error.details[0].message, 400);
    }

    const user = await getUserById(userId);

    if (!user) {
      throw generateError("User not found", 404);
    }

    const { username, name, lastname, address, gender, email, password, bio } =
      value;

    let imageFileName;

    if (req.files?.profile_image) {
      //Creo el path del directorio uploads
      const uploadsDir = path.join(__dirname, "../uploads");
      const profileImageDir = path.join(__dirname, "../uploads/profileImage");
      //Creo el directorio si no existe
      await createPathIfNotExists(uploadsDir);
      await createPathIfNotExists(profileImageDir);
      //Procesar la imagen
      const image = sharp(req.files.profile_image.data);
      //verifico que el archivo contenga las extensiones jpg o png
      const fileName = req.files.profile_image.name;
      if (fileName.endsWith(".jpg") || fileName.endsWith(".png")) {
        image.resize(256);
      } else {
        throw generateError(
          "You must enter an image with jpg or png extension",
          400
        );
      }
      //Guardo la imagen con un nombre aleatorio en el directorio uploads
      imageFileName = `${randomName(16)}.jpg`;

      await image.toFile(path.join(uploadsDir, imageFileName));
    }

    try {
      await updateUser(
        userId,
        username,
        name,
        lastname,
        address,
        gender,
        email,
        password,
        imageFileName,
        bio
      );

      res.status(200).json({ message: "Profile updated successfully" });
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
          error:
            "Username or email already exists. Please choose a different username.",
        });
      }

      throw err; // Lanzar el error para ser manejado por el manejador de errores global
    }
  } catch (err) {
    next(err);
  }
};
const getUserController = async (req, res, next) => {
  try {
    const { error } = getUserSchema.validate(req.params);

    if (error) {
      throw generateError(error.details[0].message, 400);
    }

    const user_id = req.params.id;
    const user = await getUserById(user_id);

    if (!user) {
      throw generateError("User not found", 404, { userId: user_id });
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
