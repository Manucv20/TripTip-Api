const express = require("express");
const router = express.Router();
const {
  newUserController,
  loginController,
  updateUserController,
  getUserController,
  updateEmailController,
  updatePasswordController,
} = require("../controllers/users");
const { authUser } = require("../middlewares/auth");

// Registrar un nuevo usuario
router.post("/user/register", newUserController);

// Iniciar sesión
router.post("/user/login", loginController);

// Actualizar usuario
router.put("/user/:id", authUser, updateUserController);

// Obtener usuario por ID
router.get("/user/:id", authUser, getUserController);

//Modificar Email
router.put("/user/email/:id", authUser, updateEmailController);

//Modificar Password
router.put("/user/password/:id", authUser, updatePasswordController);

module.exports = router;
