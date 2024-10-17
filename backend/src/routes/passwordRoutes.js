const express = require('express');
const {
  checkPassword,
  sendVerificationCode,
  verifyCode,
  changePassword
} = require('../controllers/passwordController');

const router = express.Router();

// Ruta para verificar contraseñas
router.post('/check-password', checkPassword);

// Ruta para enviar código de verificación
router.post('/send-code', sendVerificationCode);

// Ruta para verificar código
router.post('/verify-code', verifyCode);

// Ruta para cambiar contraseña
router.post('/change-password', changePassword);

module.exports = router;
