const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');
const { authenticateToken } = require('../middlewares/auth');  // Middleware de autenticación

router.post('/crear', ventaController.createVenta);
router.get('/usuario/:usuario_id', authenticateToken, ventaController.getVentasByUsuario);
router.get('/:venta_id', authenticateToken, ventaController.getVentaById);
router.post('/paypal/create-order', ventaController.createOrder);
router.post('/paypal/capture-order/:orderID', ventaController.captureOrder);
router.post('/mercadopago/create-preference', ventaController.createPreference);
router.get('/estadisticas/ventas', ventaController.getEstadisticasVentas);
router.post('/mercadopago/registrar-transaccion', ventaController.registrarTransaccionMercadoPago);



module.exports = router;
