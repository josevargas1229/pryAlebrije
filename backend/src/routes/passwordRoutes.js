const express = require('express');
const { checkPassword } = require('../controllers/passwordController');

const router = express.Router();

// Ruta para verificar contraseñas
router.post('', checkPassword);

module.exports = router;
