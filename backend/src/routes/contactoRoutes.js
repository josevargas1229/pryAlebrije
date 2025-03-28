const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authenticateToken } = require('../middlewares/auth');  // Si deseas proteger la ruta con autenticación

router.post('/enviar',contactController.sendContactMessage);

module.exports = router;
