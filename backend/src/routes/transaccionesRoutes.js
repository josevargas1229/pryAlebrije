const express = require('express');
const router = express.Router();
const transaccionesController = require('../controllers/transaccionesController');

router.get('/', transaccionesController.getTodas);
router.get('/estado/:estado', transaccionesController.getPorEstado);
router.get('/usuario/:usuario_id', transaccionesController.getPorUsuario);

module.exports = router;
