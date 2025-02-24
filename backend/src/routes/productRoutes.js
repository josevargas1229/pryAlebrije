const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productController');
const { authenticateToken, authorize, ROLES } = require('../middlewares/auth');
router.post('/', authenticateToken, authorize(ROLES.ADMINISTRADOR), productoController.createProducto);
router.get('/', productoController.getAllProductos);
router.get('/filters', productoController.getAllFilters);
router.get('/:id', productoController.getProductoById);
router.put('/:id', authenticateToken, authorize(ROLES.ADMINISTRADOR), productoController.updateProducto);

module.exports = router;