const rateLimit = require('express-rate-limit');

// Configuración de limitación de tasa
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limitar cada IP a 100 solicitudes por ventana
  standardHeaders: 'draft-7', // Proporcionar encabezados de limitación de tasa
  legacyHeaders: false, // Deshabilitar los encabezados X-RateLimit-*
});

// Exportar el middleware
module.exports = limiter;