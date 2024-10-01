/* This code snippet is setting up a basic Express server in Node.js. Here's a breakdown of what each
part is doing: */
const express = require('express');
const corsConfig = require('./config/corsConfig');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middlewares/errorHandler');
const app = express();
// Middleware, rutas, etc.
app.use(corsConfig);
app.use(express.json());
app.use('/users', userRoutes);
app.use('/auth', authRoutes);
// Ejemplo de ruta
app.get('/', (req, res) => {
    res.send('¡Hola Mundo!');
});
app.use(errorHandler);
module.exports = app;
