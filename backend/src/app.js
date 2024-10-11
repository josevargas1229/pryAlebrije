/* This code snippet is setting up a basic Express server in Node.js. Here's a breakdown of what each
part is doing: */
const express = require('express');
const corsConfig = require('./config/corsConfig');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middlewares/errorHandler');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const app = express();
// Middleware, rutas, etc.
app.use(corsConfig);
app.use(express.json());
app.use(cookieParser());
// Ejemplo de ruta
app.get('/', (req, res) => {
    res.send('¡Hola Mundo!');
});
app.use('/users', userRoutes);
app.use('/auth', authRoutes);
let passwordList = new Set();

fs.readFile(path.join(__dirname, '100k-most-used-passwords-NCSC.txt'), 'utf8', (err, data) => {
    if (err) {
        console.error('Error al leer el archivo de contraseñas:', err);
        process.exit(1);
    }
    // Almacena las contraseñas en un Set para búsquedas rápidas
    passwordList = new Set(data.split('\n').map(password => password.trim()));
    console.log('Lista de contraseñas cargada correctamente');
});
app.post('/check-password', (req, res) => {
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ error: 'Debe proporcionar una contraseña' });
    }

    const isCompromised = passwordList.has(password);
    if (isCompromised) {
        return res.json({ message: 'La contraseña ha sido filtrada. Por favor, elige una más segura.' });
    } else {
        return res.json({ message: 'La contraseña no se encuentra en la lista de contraseñas filtradas.' });
    }
});
app.use(errorHandler);
module.exports = app;
