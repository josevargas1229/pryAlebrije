const express = require('express');
const { checkPassword, verifyCode, changePassword, sendVerificationCode } = require('../controllers/passwordController');
const { doubleCsrfProtection } = require('../config/csrfConfig');
const router = express.Router();

// Ruta para verificar contraseñas
router.post('/check',doubleCsrfProtection, checkPassword);
router.post('/send-code', sendVerificationCode);
router.post('/verify-code', verifyCode);
router.post('/change-password', changePassword);

module.exports = router;
