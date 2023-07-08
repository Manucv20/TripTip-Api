const express = require("express");
const {
  sendActivationEmail,
  activateAccountController,
} = require("../controllers/email");

const router = express.Router();

// Enviar Email
router.post("/email/send", sendActivationEmail);

//Activación de cuenta por email
router.get("/activate-account/:token", activateAccountController);

module.exports = router;
