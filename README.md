# API de viajes recomendados v1.0

La API de viajes recomendados permite a los usuarios publicar y comentar recomendaciones de sitios o experiencias
poco conocidas de viajes. Los usuarios pueden buscar recomendaciones por lugar, categoría o por usuario, ordenar
los resultados de búsqueda por votos, ver detalles de una recomendación, iniciar sesión y registrarse en la plataforma.

## Funcionalidades

- Buscar recomendaciones por lugar, categoría o por usuario
- Ordenar los resultados de búsqueda por votos
- Ver detalles de una recomendación
- Login con email y contraseña
- Registro con usuario, nombre, apellido, calle, genero, email, contraseña, biografia y foto de perfil

### Usuarios registrados

Los usuarios registrados tienen acceso a las siguientes funcionalidades:

- Publicar recomendaciones con título, categoría, lugar, entradilla, texto y foto
- Borrar sus propias recomendaciones
- Publicar comentarios en las recomendaciones
- Votar recomendaciones de otros usuarios
- Gestión del perfil, incluyendo foto de perfil

## Tecnologías utilizadas

- Bcrypt
- Dotenv
- Eslint
- Express
- Express-fileupload
- Express-validator
- Joi
- Jsonwebtoken
- Morgan
- Multer
- Mysql
- Mysql2
- Nanoid
- Nodemon
- Prettier
- Sharp
- Uuid

## Rutas de la API

### Rutas de recomendaciones

- Crear nueva recomendación: POST /recommendations/
- Borrar recomendación: DELETE /recommendations/:id
- Obtener todas las recomendaciones por localización o categoría: GET /recommendations
- Obtener recomendación por ID: GET /recommendation/:id
- Obtener recomendaciones ordenadas por votos: GET /recommendations/orderedByVotes
- Obtener recomendaciones de un usuario: GET /users/:id/recommendations
- Actualizar recomendación hecha: PUT /recommendations/:id

### Rutas de comentarios

- Crear un nuevo comentario en una recomendación: POST /recommendations/comments/:id
- Obtener comentarios por ID de recomendación: GET /recommendations/:id/comments
- Borrar comentario por ID: DELETE /comments/:idUsuario

### Rutas de votos

- Crear un nuevo voto en una recomendación: POST /votes/:idDeRecomendacion

### Rutas de usuarios

- Registrar un nuevo usuario: POST /user/register
- Iniciar sesión: POST /user/login
- Actualizar usuario: PUT /user/:id
- Obtener usuario por ID: GET /user/:id

## Instalación de dependencias

- Instalar las dependencias con `npm install`.

## Crear las tablas de la base de datos

- Ejecuta en terminal `node .\db\initDB.js`

Con este comando permite inicializar las tablas en la base de datos utilizando Node.js.
Al ejecutar este comando, se conecta a la base de datos y crea las tablas necesarias para
el funcionamiento de la API. Este comando debe ser ejecutado una sola vez, antes de utilizar
la API por primera vez, o en caso de que se requiera reiniciar las tablas de la base de datos.

## Configurar las variables de entorno

- Crear un archivo `.env` en la raíz del proyecto.
- Copiar el contenido del archivo `.env.example` en el archivo `.env`.
- Configurar las variables de entorno en el archivo `.env`.

## Iniciar el servidor

- Iniciar el servidor con `npm run start`.
