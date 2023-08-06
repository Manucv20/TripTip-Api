// Carga las variables de entorno desde el archivo .env
require("dotenv").config();

// Importa los módulos necesarios
const path = require("path");
const axios = require("axios");
const { promisify } = require("util");
const { getConnection } = require("./db");
const bcrypt = require("bcrypt");
const fs = require("fs");
const ProgressBar = require("progress");  // Importa la biblioteca cli-progress

// Tamaño de las imágenes a descargar
const IMAGE_SIZE = "1024x1024";

// URL de la API de Unsplash
const API_URL = "https://source.unsplash.com";

// Cantidad de imágenes a obtener
const imageCount = 20;

// Función para obtener URLs aleatorias de imágenes
async function fetchRandomImageUrls(count) {
  const category = "nature"; // Ajusta esto según tus necesidades
  const imageUrls = [];

  for (let i = 0; i < count; i++) {
    const imageUrl = `${API_URL}/${IMAGE_SIZE}/?${category}&random=${Math.random()}`;
    imageUrls.push(imageUrl);
  }

  return imageUrls;
}

// Función para subir una imagen al almacenamiento
async function uploadImageToStorage(imageUrl) {
  console.log(`Descargando imagen: ${imageUrl}`);
  const response = await axios.get(imageUrl, { responseType: "stream" });

  const imageExtension = ".jpg";
  const imageName = generateImageName();
  const uploadedImagePath = path.join("uploads", `${imageName}${imageExtension}`);

  const totalBytes = Number(response.headers["content-length"]);
  let completedBytes = 0;

  // Utiliza la biblioteca cli-progress para mostrar la barra de progreso
  const progressBar = new ProgressBar('  [:bar] :percent :etas', {
    complete: '=',
    incomplete: ' ',
    width: 40,
    total: totalBytes,
  });

  const writeStream = fs.createWriteStream(uploadedImagePath);

  writeStream.on("finish", () => {
    progressBar.terminate(); // Termina la barra de progreso
    progressBar.tick(totalBytes); // Marca como completados todos los ticks restantes
    console.log(`Imagen descargada y guardada: ${uploadedImagePath}\n`); // Imprime el mensaje de éxito con un salto de línea

  });

  writeStream.on("error", (error) => {
    console.error("Error al guardar la imagen:", error);
  });

  // Escucha el evento "data" para actualizar la barra de progreso
  response.data
    .on("data", (chunk) => {
      completedBytes += chunk.length;
      progressBar.tick(chunk.length); // Actualiza la barra de progreso
      writeStream.write(chunk);
    })
    .on("end", () => {
      writeStream.end(); // Finaliza el flujo de escritura
    });

  // Espera a que finalice la escritura antes de continuar
  await new Promise((resolve) => {
    writeStream.on("close", resolve);
  });

  return `${imageName}${imageExtension}`;
}

// Función para generar un nombre de imagen aleatorio
function generateImageName() {
  const characters = "0123456789abcdef";
  let imageName = "";
  for (let i = 0; i < 32; i++) {
    imageName += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return imageName;
}

// Función para generar datos de ejemplo
async function generateSampleData() {
  // Arrays con datos de ejemplo
  const categories = [
    "Safari",
    "Senderismo",
    "Deportes",
    "Compras",
    "Aventura",
    "Playa",
    "Coche",
    "Familia",
    "Amor",
    "Naturaleza"
  ];

  const locations = [
    "Nueva York",
    "París",
    "Tokio",
    "Roma",
    "Londres",
    "Sídney",
    "Río de Janeiro",
    "Ciudad del Cabo",
    "Moscú",
    "Dubái"
  ];

  const summaries = [
    "Descubre la vibrante ciudad de Nueva York y explora sus icónicos puntos de interés y atracciones.",
    "Vive el encanto romántico de París y disfruta de su exquisita gastronomía y arte.",
    "Sumérgete en las bulliciosas calles de Tokio y abraza su mezcla única de tradición y modernidad.",
    "Viaja en el tiempo en Roma y maravíllate con sus ruinas antiguas y maravillas arquitectónicas.",
    "Descubre la rica historia y la herencia real de Londres a través de sus majestuosos palacios y museos.",
    "Disfruta de las playas bañadas por el sol de Sídney y abraza un estilo de vida costero relajado.",
    "Baila samba por las coloridas calles de Río de Janeiro durante el Carnaval.",
    "Embárcate en una aventura de safari en Ciudad del Cabo y encuentra la vida silvestre en su hábitat natural.",
    "Experimenta la grandeza de Moscú y explora sus suntuosos palacios y monumentos icónicos.",
    "Date un lujo de lujo y extravagancia en la deslumbrante ciudad de Dubái."
  ];

  const imageUrls = await fetchRandomImageUrls(imageCount);

  let connection;

  try {
    connection = await getConnection();

    // Generar ejemplos de usuarios
    const userCount = 2;

    for (let i = 1; i <= userCount; i++) {
      const user = {
        username: `user${i}`,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        password: "password123", // Cambia esto por la contraseña real
        created_at: new Date().toISOString(),
        isActivated: 1, // Establece isActivated en 1
      };

      // Hashear la contraseña
      const saltRounds = 10;
      const hashedPassword = await promisify(bcrypt.hash)(user.password, saltRounds);
      user.password = hashedPassword;

      // Subir y agregar imagen al usuario
      const imageUrl = imageUrls[i - 1];
      const imageName = await uploadImageToStorage(imageUrl);
      user.profile_image = imageName;

      await connection.query("INSERT INTO users SET ?", user);
    }

    // Generar ejemplos de recomendaciones
    const recommendations = [];

    for (let i = 0; i < categories.length; i++) {
      const user_id = Math.floor(Math.random() * userCount) + 1;
      const category = categories[i];
      const location = locations[i];
      const summary = summaries[i];
      const details = "Lorem ipsum dolor sit amet, consectetur adipiscing elit...";
      const imageUrl = imageUrls[i];

      for (let j = 0; j < 4; j++) {
        const title = `${category} Experiencia ${j + 1}`;

        const imageName = await uploadImageToStorage(imageUrl);

        recommendations.push({ user_id, title, category, location, summary, details, image: imageName });
      }
    }

    shuffleArray(recommendations);

    for (const recommendation of recommendations) {
      await connection.query("INSERT INTO recommendations SET ?", recommendation);
    }

    console.log("Datos de ejemplo creados exitosamente!");
  } catch (error) {
    console.error("Ocurrió un error:", error);
  } finally {
    if (connection) {
      connection.release();
    }
    process.exit();
  }
}

// Función para mezclar un array de forma aleatoria
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Función para generar datos de ejemplo junto con imágenes
async function generateSampleDataWithImages() {
  try {
    await generateSampleData();
  } catch (error) {
    console.error("Error al generar datos de ejemplo:", error);
  }
}

// Llama a la función para generar datos de ejemplo con imágenes
generateSampleDataWithImages();