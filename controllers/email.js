const { generateError } = require("../helpers");

const Mailjet = require("node-mailjet");
const { getUserByToken, activateUser } = require("../db/email");

//Servicio de correo electronico
const mailjet = new Mailjet({
  apiKey: process.env.MJ_APIKEY_PUBLIC || "",
  apiSecret: process.env.MJ_APIKEY_PRIVATE || "",
});

const sendActivationEmail = async (username, email, token, frontendURL) => {
  try {
    const { response } = await mailjet
      .post("send", { version: "v3.1" })
      .request({
        Messages: [
          {
            From: {
              Email: process.env.SENDER_EMAIL,
              Name: "TripTip",
            },
            To: [
              {
                Email: email,
                Name: "passenger 1",
              },
            ],
            Subject: "User Activation",
            TextPart:
              "Dear passenger 1, welcome to Mailjet! May the delivery force be with you!",
            HTMLPart: `<h3>Hi ${username},</h3> <p>You are the newest member of TripTip, a community for sharing unique and unusual experiences while traveling the world. We are happy to have you and we hope to see your travel recommendations very soon.</p><p>Please verify your email address through this link:</p><a href="${frontendURL}/activate/${token}">https://triptip.com/activate/${token}</a><br /><p>Your access data:</p><p>Email address: ${email} <br /> Username: ${username}</p><p>Your team TripTip</p>`,
          },
        ],
      });

    return response.status;
  } catch (error) {
    throw generateError(error.message, 400);
  }
};

const activateAccountController = async (req, res, next) => {
  try {
    const { token } = req.params;

    // Verifica que el token sea válido y obtener el usuario asociado
    const user = await getUserByToken(token);

    if (!user) {
      throw generateError("Invalid activation token", 400);
    }

    if (user.isActivated) {
      throw generateError("Token has already been used", 400);
    }

    // Actualizar el campo isActivated del usuario a true
    await activateUser(user.id);

    res.status(200).json({ message: "Account activated successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = { sendActivationEmail, activateAccountController };
