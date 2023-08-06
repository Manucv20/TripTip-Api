# API de Recomendaciones de Viajes v1.0

La API de Recomendaciones de Viajes permite a los usuarios publicar y comentar recomendaciones de sitios o experiencias poco conocidas de viajes. Los usuarios pueden buscar recomendaciones por lugar, categoría o usuario, ordenar los resultados de búsqueda por votos, ver detalles de una recomendación, iniciar sesión y registrarse en la plataforma.

## Funcionalidades

- Buscar recomendaciones por lugar, categoría o usuario
- Ordenar los resultados de búsqueda por votos
- Ver detalles de una recomendación
- Iniciar sesión con correo electrónico y contraseña
- Registrarse con usuario, nombre, apellido, dirección, género, correo electrónico, contraseña, biografía y foto de perfil

### Usuarios registrados

Los usuarios registrados tienen acceso a las siguientes funcionalidades:

- Publicar recomendaciones con título, categoría, lugar, entradilla, texto y foto
- Borrar sus propias recomendaciones
- Publicar comentarios en las recomendaciones
- Votar recomendaciones de otros usuarios
- Gestionar el perfil, incluyendo foto de perfil

## Tecnologías utilizadas

- Axios
- Bcrypt
- Cli-progress
- Cors
- Dotenv
- Eslint
- Express
- Express-fileupload
- Express-validator
- Har-validator
- Joi
- Jsonwebtoken
- Morgan
- Multer
- Mysql
- Mysql2
- Nanoid
- Node-mailjet
- Nodemailer
- Nodemon
- Prettier
- Progress
- Request
- Sharp
- Uuid

## Rutas de la API

### Rutas de recomendaciones

- Crear una nueva recomendación: POST /recommendations
- Borrar una recomendación: DELETE /recommendations/:id
- Obtener todas las recomendaciones por ubicación o categoría: GET /recommendations
- Obtener una recomendación por ID: GET /recommendation/:id
- Obtener recomendaciones ordenadas por votos: GET /recommendations/orderedByVotes
- Obtener recomendaciones de un usuario: GET /users/:id/recommendations
- Actualizar una recomendación: PUT /recommendations/:id

### Rutas de comentarios

- Crear un nuevo comentario en una recomendación: POST /recommendations/comments/:id
- Obtener comentarios por ID de recomendación: GET /recommendations/:id/comments
- Borrar un comentario por ID: DELETE /comments/:id

### Rutas de votos

- Crear un nuevo voto en una recomendación: POST /votes/:idDeRecomendacion
- Obtener los votos realizados por un usuario: GET /users/:user_id/votes
- Borrar un voto específico: DELETE /users/:user_id/votes/:recommendation_id

### Rutas de usuarios

- Registrar un nuevo usuario: POST /user/register
- Iniciar sesión: POST /user/login
- Actualizar usuario: PUT /user/:id
- Obtener usuario por ID: GET /user/:id
- Modificar correo electrónico: PUT /user/email/:id
- Modificar contraseña: PUT /user/password/:id

### Rutas de correo electrónico

- Enviar correo electrónico: POST /email/send
- Activación de cuenta por correo electrónico: GET /activate-account/:token

## Instalación de dependencias

- Instalar las dependencias con `npm install`.

## Crear las tablas de la base de datos

- Ejecuta en la terminal `node .\db\initDB.js`.

Este comando permite inicializar las tablas en la base de datos utilizando Node.js. Al ejecutar este comando, se conecta a la base de datos y crea las tablas necesarias para el funcionamiento de la API. Este comando debe ser ejecutado una sola vez, antes de utilizar la API por primera vez, o en caso de que se requiera reiniciar las tablas de la base de datos.

## Generar datos de ejemplo

- Ejecuta en la terminal `node .\db\sampleData.js`.

Este comando generará datos de ejemplo en la base de datos. Los datos de ejemplo incluirán usuarios de ejemplo y recomendaciones asociadas a esos usuarios. Ten en cuenta que este comando generará datos de ejemplo y puede afectar los datos existentes en la base de datos. Úsalo con precaución y solo con fines de desarrollo o pruebas.

El Script crea dos perfiles con recomendaciones, donde el correo es user1@example.com y user2@example.com con su respectiva contraseña que se hashea pero que es password123.

Recuerda que debes haber ejecutado previamente el comando `node .\db\initDB.js` para crear las tablas necesarias en la base de datos antes de ejecutar el comando `node .\db\sampleData.js`.

## Configurar las variables de entorno

- Crea un archivo `.env` en la raíz del proyecto.
- Copia el contenido del archivo `.env.example` en el archivo `.env`.
- Configura las variables de entorno en el archivo `.env` según la configuración de tu entorno de desarrollo.

## Iniciar el servidor

- Inicia el servidor con el comando `npm run start`.

Con este comando, el servidor de la API comenzará a escuchar en el puerto especificado en el archivo `.env`. Ahora puedes comenzar a enviar solicitudes a la API utilizando herramientas como Postman o realizar integraciones con aplicaciones frontend.
