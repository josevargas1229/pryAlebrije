const express = require('express');
const router = express.Router();
const { getTiposProducto, createTipoProducto, updateTipoProducto } = require('../controllers/tipoProductoController');
const { authenticateToken, authorize, ROLES } = require('../middlewares/auth');

router.get('/', getTiposProducto);
router.post('/', authenticateToken, authorize(ROLES.ADMINISTRADOR), createTipoProducto);
router.put('/:id', authenticateToken, authorize(ROLES.ADMINISTRADOR), updateTipoProducto);

module.exports = router;