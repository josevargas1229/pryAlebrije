const express = require('express');
const router = express.Router();
const { getCategorias, createCategoria, updateCategoria } = require('../controllers/categoriasController');
const { authenticateToken, authorize, ROLES } = require('../middlewares/auth');

router.get('/', getCategorias);
router.post('/', authenticateToken, authorize(ROLES.ADMINISTRADOR), createCategoria);
router.put('/:id', authenticateToken, authorize(ROLES.ADMINISTRADOR), updateCategoria);

module.exports = router;