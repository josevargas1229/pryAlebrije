const express = require('express');
const router = express.Router();
const tipoProductoController = require('../controllers/tipoProductoController');
const { authenticateToken, authorize, ROLES } = require('../middlewares/auth');
router.get('/', tipoProductoController.getTiposProducto);
router.post('/', authenticateToken, authorize(ROLES.ADMINISTRADOR),  tipoProductoController.createTipoProducto);

module.exports = router;