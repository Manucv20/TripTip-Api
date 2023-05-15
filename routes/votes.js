const express = require("express");
const router = express.Router();
const { NewVoteController } = require("../controllers/votes");
const { authUser } = require("../middlewares/auth");

// Crear un nuevo voto
router.post("/votes/:id", authUser, NewVoteController);

module.exports = router;
