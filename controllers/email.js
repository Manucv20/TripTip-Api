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
            TextPart: `¡Estimado ${username}, bienvenido a Mailjet! ¡Que la fuerza de entrega esté contigo!`,
            HTMLPart: `<h3>Hola ${username},</h3> <p>Eres el miembro más reciente de TripTip, una comunidad para compartir experiencias únicas e inusuales mientras viajas por el mundo. Estamos felices de tenerte y esperamos ver tus recomendaciones de viaje muy pronto.</p><p>Por favor, verifica tu dirección de correo electrónico a través de este enlace:</p><a href="${frontendURL}/activate/${token}">https://triptip.com/activate/${token}</a><br /><p>Tus datos de acceso:</p><p>Email: ${email} <br /> Username: ${username}</p><p>Tu equipo TripTip</p>`,
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
      throw generateError("Token de activación inválido.", 400);
    }

    if (user.isActivated) {
      throw generateError("El token ya ha sido utilizado.", 400);
    }

    // Actualizar el campo isActivated del usuario a true
    await activateUser(user.id);

    res.status(200).json({ message: "Cuenta activada exitosamente." });
  } catch (err) {
    next(err);
  }
};

module.exports = { sendActivationEmail, activateAccountController };
