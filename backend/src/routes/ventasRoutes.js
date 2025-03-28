const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');
const { authenticateToken } = require('../middlewares/auth');  // Middleware de autenticación

router.post('/crear', ventaController.createVenta);
router.get('/usuario/:usuario_id', authenticateToken, ventaController.getVentasByUsuario);
router.get('/:venta_id', authenticateToken, ventaController.getVentaById);

module.exports = router;
