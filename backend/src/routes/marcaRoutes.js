const express = require('express');
const router = express.Router();
const { getMarcas, createMarca, updateMarca } = require('../controllers/marcaController');
const { authenticateToken, authorize, ROLES } = require('../middlewares/auth');

router.get('/', getMarcas);
router.post('/', authenticateToken, authorize(ROLES.ADMINISTRADOR), createMarca);
router.put('/:id', authenticateToken, authorize(ROLES.ADMINISTRADOR), updateMarca);

module.exports = router;