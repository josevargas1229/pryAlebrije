const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');
const { authenticateToken } = require('../middlewares/auth');  // Middleware de autenticación
const { authorize, ROLES } = require('../middlewares/auth');
router.post('/crear', ventaController.createVenta);
router.get('/usuario/:usuario_id', authenticateToken, ventaController.getVentasByUsuario);
router.get('/estadisticas/alexa', authorize(ROLES.ADMINISTRADOR), ventaController.getEstadisticasVentasAlexa);
router.get('/estadisticas/ventas', authorize(ROLES.ADMINISTRADOR), ventaController.getEstadisticasVentas);
router.get('/:venta_id', authenticateToken, ventaController.getVentaById);
router.post('/paypal/create-order', ventaController.createOrder);
router.post('/paypal/capture-order/:orderID', ventaController.captureOrder);
router.post('/mercadopago/create-preference', ventaController.createPreference);

router.post('/mercadopago/registrar-transaccion', ventaController.registrarTransaccionMercadoPago);



module.exports = router;
