require('dotenv').config();

const { getConnection } = require('./db');

async function main() {
  let connection;

  try {
    connection = await getConnection();

    console.log('Borrando tablas existentes');
    await connection.query('DROP TABLE IF EXISTS comments');
    await connection.query('DROP TABLE IF EXISTS votes');
    await connection.query('DROP TABLE IF EXISTS recommendations');
    await connection.query('DROP TABLE IF EXISTS users');

    console.log('creando tablas');

    await connection.query(`CREATE TABLE users (
id INT PRIMARY KEY AUTO_INCREMENT,
username VARCHAR(50) NOT NULL,
name VARCHAR(50) NOT NULL,
lastname varchar(50),
address text not null,
gender varchar(10) not null,
email VARCHAR(90) NOT NULL UNIQUE,
password VARCHAR(90) NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
profile_image VARCHAR(255),
bio varchar(255)
);`);

    await connection.query(`CREATE TABLE recommendations (
id INT PRIMARY KEY AUTO_INCREMENT,
user_id INT NOT NULL,
title VARCHAR(100) NOT NULL,
category VARCHAR(50) NOT NULL,
location VARCHAR(100) NOT NULL,
summary VARCHAR(100) NOT NULL,
details TEXT NOT NULL,
image VARCHAR(255),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);`);

    await connection.query(`CREATE TABLE votes (
id INT PRIMARY KEY AUTO_INCREMENT,
user_id INT NOT NULL,
recommendation_id INT NOT NULL,
value INT NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
FOREIGN KEY (recommendation_id) REFERENCES recommendations(id) ON DELETE CASCADE
);`);

    await connection.query(`CREATE TABLE comments (
id INT PRIMARY KEY AUTO_INCREMENT,
user_id INT NOT NULL,
recommendation_id INT NOT NULL,
comment TEXT NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
FOREIGN KEY (recommendation_id) REFERENCES recommendations(id) ON DELETE CASCADE
);`);
  } catch (error) {
    console.log(error);
  } finally {
    if (connection) connection.release();
    process.exit();
  }
}

main();
