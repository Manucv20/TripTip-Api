require("dotenv").config();
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const { promisify } = require("util");
const { getConnection } = require("./db");
const bcrypt = require("bcrypt");

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

async function uploadImageToStorage(imageUrl) {
  console.log(`Downloading image: ${imageUrl}`);
  const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
  const imageBuffer = Buffer.from(response.data);
  const imageExtension = ".jpg";
  const imageName = generateImageName();
  const uploadedImagePath = path.join("uploads", `${imageName}${imageExtension}`);
  await writeFileAsync(uploadedImagePath, imageBuffer);
  return `${imageName}${imageExtension}`;
}

function generateImageName() {
  const characters = "0123456789abcdef";
  let imageName = "";
  for (let i = 0; i < 32; i++) {
    imageName += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return imageName;
}

async function generateSampleData() {
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
    "Discover the vibrant city of New York and explore its iconic points of interest and attractions.",
    "Experience the romantic charm of Paris and indulge in its exquisite cuisine and art.",
    "Immerse yourself in the bustling streets of Tokyo and embrace its unique blend of tradition and modernity.",
    "Travel back in time in Rome and marvel at its ancient ruins and architectural wonders.",
    "Uncover the rich history and royal heritage of London through its majestic palaces and museums.",
    "Enjoy the sun-drenched beaches of Sydney and embrace a relaxed coastal lifestyle.",
    "Samba through the colorful streets of Rio de Janeiro during Carnival.",
    "Embark on a safari adventure in Cape Town and encounter wildlife in its natural habitat.",
    "Experience the grandeur of Moscow and explore its opulent palaces and iconic landmarks.",
    "Indulge in luxury and extravagance in the dazzling city of Dubai."
  ];

  const imageUrls = await fetchRandomImageUrls(20);

  let connection;

  try {
    connection = await getConnection();

    // Generate example users
    const userCount = 2;

    for (let i = 1; i <= userCount; i++) {
      const user = {
        username: `user${i}`,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        password: "password123", // Change this to the actual password
        created_at: new Date().toISOString(),
        isActivated: 1, // Set isActivated to 1
      };

      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(user.password, saltRounds);
      user.password = hashedPassword;

      // Upload and add image to the user
      const imageUrl = imageUrls[i - 1];
      const imageName = await uploadImageToStorage(imageUrl);
      user.profile_image = imageName;

      await connection.query("INSERT INTO users SET ?", user);
    }

    // Generate example recommendations
    const recommendations = [];

    for (let i = 0; i < categories.length; i++) {
      const user_id = Math.floor(Math.random() * userCount) + 1;
      const category = categories[i];
      const location = locations[i];
      const summary = summaries[i];
      const details = "Lorem ipsum dolor sit amet, consectetur adipiscing elit...";
      const imageUrl = imageUrls[i];

      for (let j = 0; j < 4; j++) {
        const title = `${category} Experience ${j + 1}`;

        const imageName = await uploadImageToStorage(imageUrl);

        recommendations.push({ user_id, title, category, location, summary, details, image: imageName });
      }
    }

    shuffleArray(recommendations);

    for (const recommendation of recommendations) {
      await connection.query("INSERT INTO recommendations SET ?", recommendation);
    }

    console.log("Sample data created successfully!");
  } catch (error) {
    console.error(error);
  } finally {
    if (connection) connection.release();
    process.exit();
  }
}

async function fetchRandomImageUrls(count) {
  const unsplashApiUrl = `https://source.unsplash.com/1024x1024/?nature`;

  try {
    const imageUrls = [];

    for (let i = 0; i < count; i++) {
      const imageUrl = `${unsplashApiUrl}&random=${Math.random()}`;
      imageUrls.push(imageUrl);
    }

    return imageUrls;
  } catch (error) {
    console.error("Error fetching imageURLs:", error);
    throw error;
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

async function generateSampleDataWithImages() {
  try {
    const imageUrls = await fetchRandomImageUrls(20);
    console.log("Fetched image URLs:", imageUrls); // Add this line to check image URLs

    await generateSampleData();
  } catch (error) {
    console.error("Error generating sample data:", error);
  }
}

generateSampleDataWithImages();
