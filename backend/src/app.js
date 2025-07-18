/* This code snippet is setting up a basic Express server in Node.js. Here's a breakdown of what each
part is doing: */
const express = require('express');
const errorHandler = require('./middlewares/errorHandler');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const {generateToken,doubleCsrfProtection} = require('./config/csrfConfig');
const corsConfig = require('./config/corsConfig');
const { combinedLogger } = require('./config/logger');
const rateLimit = require('./config/rateLimitConfig');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const passwordRoutes = require('./routes/passwordRoutes');
const emailTypeRoutes = require('./routes/emailTypeRoutes');
const bloqueosRoutes = require('./routes/bloqueosRoutes');
const logsRoutes = require('./routes/logsRoutes');
const companyProfileRoutes = require('./routes/companyProfileRoutes');
const emailTemplateRoutes = require('./routes/emailTemplateRoutes');
const legalDocumentRoutes = require('./routes/legalDocumentRoutes');
const configurationRoutes = require('./routes/configurationRoutes');
const tallaRoutes = require('./routes/tallaRoutes');
const colorRoutes = require('./routes/colorRoutes');
const marcaRoutes = require('./routes/marcaRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const tipoProductoRoutes = require('./routes/tipoProductoRoutes');
const temporadaRoutes = require('./routes/temporadaRoutes');
const productoRoutes = require('./routes/productRoutes');
const ventasRoutes = require('./routes/ventasRoutes');
const calificacionProductoRoutes = require('./routes/calificacionProductoRoutes');
const historialRoutes = require('./routes/historialRoutes');
const contactoRoutes = require('./routes/contactoRoutes');
const transaccionesRoutes = require('./routes/transaccionesRoutes');
const promocionRoutes = require('./routes/promocionRoutes');
const notificacionesRoutes = require('./routes/notificacionRoutes');
const { authenticateToken, authorize, ROLES } = require('./middlewares/auth');
const app = express();

app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : false);

// Middleware de seguridad
app.use(helmet());

// Middleware de configuración CORS
app.use(corsConfig);

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(rateLimit);

// Ruta para obtener el token CSRF
app.get('/csrf-token', (req, res) => {
    const csrfToken = generateToken(req, res);
    res.json({ csrfToken });
});

// Middleware de protección CSRF
app.use((req, res, next) => {
  // Excluir rutas específicas del CSRF (por ejemplo, las usadas por Alexa)
  const csrfExcludedRoutes = [
    '/auth/token' // token exchange de Alexa
  ];

  if (csrfExcludedRoutes.includes(req.path)) {
    return next();
  }

  return doubleCsrfProtection(req, res, next);
});


// Integrar Morgan con Winston para el registro de solicitudes HTTP
app.use(morgan('combined', {
    stream: {
        write: (message) => combinedLogger.info(message.trim()) // Usa combinedLogger aquí
    }
}));

// Ejemplo de ruta
app.get('/', (req, res) => {
    res.send('¡Hola Mundo!');
});
app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/password',passwordRoutes);
app.use('/email-types',authenticateToken, authorize(ROLES.ADMINISTRADOR), emailTypeRoutes);
app.use('/email-templates',authenticateToken, authorize(ROLES.ADMINISTRADOR), emailTemplateRoutes);
app.use('/legal-documents', legalDocumentRoutes);
app.use('/configuration',authenticateToken, authorize(ROLES.ADMINISTRADOR), configurationRoutes);
app.use('/bloqueos',authenticateToken, authorize(ROLES.ADMINISTRADOR), bloqueosRoutes);
app.use('/logs', authenticateToken, authorize(ROLES.ADMINISTRADOR), logsRoutes);
app.use('/perfil',companyProfileRoutes);
app.use('/talla', tallaRoutes);
app.use('/color', colorRoutes);
app.use('/marca', marcaRoutes);
app.use('/tipoProducto', tipoProductoRoutes);
app.use('/temporada', temporadaRoutes);
app.use('/producto', productoRoutes);
app.use('/categorias', categoryRoutes);
app.use('/ventas', authenticateToken, ventasRoutes);
app.use('/calificacion', calificacionProductoRoutes);
app.use('/historial',historialRoutes);
app.use('/contacto', contactoRoutes);
app.use('/transacciones', transaccionesRoutes);
app.use('/promociones', promocionRoutes);
app.use('/notificaciones', authenticateToken, notificacionesRoutes);
app.use(errorHandler);
module.exports = app;

