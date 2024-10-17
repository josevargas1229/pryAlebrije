const express = require('express');
const { checkPassword } = require('../controllers/passwordController');
const { doubleCsrfProtection } = require('../config/csrfConfig');
const router = express.Router();

// Ruta para verificar contraseñas
router.post('',doubleCsrfProtection, checkPassword);

module.exports = router;
