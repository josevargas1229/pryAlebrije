/* This code snippet is setting up a basic Express server in Node.js. Here's a breakdown of what each
part is doing: */
const express = require('express');
const errorHandler = require('./middlewares/errorHandler');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const {generateToken,doubleCsrfProtection} = require('./config/csrfConfig');
const corsConfig = require('./config/corsConfig');
const logger = require('./config/logger');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const passwordRoutes = require('./routes/passwordRoutes');
const app = express();

// Middleware de seguridad
app.use(helmet());

// Middleware de configuración CORS
app.use(corsConfig);

// Middleware para parsear JSON
app.use(express.json());
app.use(cookieParser());


// Ruta para obtener el token CSRF
app.get('/csrf-token', (req, res) => {
    const csrfToken = generateToken(req, res);
    res.json({ csrfToken });
});
// Middleware de protección CSRF
app.use(doubleCsrfProtection);

// Integrar Morgan con Winston para el registro de solicitudes HTTP
app.use(morgan('combined', {
    stream: {
        write: (message) => logger.info(message.trim()) // Envía las solicitudes HTTP a Winston
    }
}));

// Ejemplo de ruta
app.get('/', (req, res) => {
    res.send('¡Hola Mundo!');
});
app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/check-password', passwordRoutes)
app.use(errorHandler);
module.exports = app;
