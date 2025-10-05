const express = require('express');
const router = express.Router();
const cuponController = require('../controllers/cuponController');
const { authenticateToken } = require('../middlewares/auth');

router.use(express.json({ limit: '2mb' }));
router.use(express.urlencoded({ limit: '2mb', extended: true }));

// Validar sin consumir (preview en carrito)
router.post('/cupones/validar', authenticateToken, cuponController.validarCupon);

// Aplicar cupón y marcarlo como usado (en checkout)
router.post('/cupones/aplicar', authenticateToken, cuponController.aplicarCupon);

module.exports = router;
