/* This code snippet is setting up a basic Express server in Node.js. Here's a breakdown of what each
part is doing: */
const express = require('express');
const corsConfig = require('./config/corsConfig');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const passwordRoutes = require('./routes/passwordRoutes');
const errorHandler = require('./middlewares/errorHandler');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

const app = express();

// Middleware de seguridad
app.use(helmet());

// Middleware de configuración CORS
app.use(corsConfig);

// Middleware para parsear JSON
app.use(express.json());
app.use(cookieParser());
// Ejemplo de ruta
app.get('/', (req, res) => {
    res.send('¡Hola Mundo!');
});
app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/check-password',passwordRoutes)
app.use(errorHandler);
module.exports = app;
