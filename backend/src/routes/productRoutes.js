const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productController');
const { authenticateToken, authorize, ROLES } = require('../middlewares/auth');
router.post('/', authenticateToken, authorize(ROLES.ADMINISTRADOR),  productoController.createProducto);
router.get('/', productoController.getAllProductos);
router.get('/filters', productoController.getAllFilters);
module.exports = router;