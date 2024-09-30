const express = require('express');
const app = express();

// Middleware, rutas, etc.
app.use(express.json());

// Ejemplo de ruta
app.get('/', (req, res) => {
    res.send('¡Hola Mundo!');
});

module.exports = app;
