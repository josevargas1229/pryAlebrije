const express = require('express');
const router = express.Router();
const categoriasController = require('../controllers/categoriasController');
const { authenticateToken, authorize, ROLES } = require('../middlewares/auth');
router.get('/', categoriasController.getCategorias);
router.post('/', authenticateToken, authorize(ROLES.ADMINISTRADOR),  categoriasController.createCategoria);

module.exports = router;