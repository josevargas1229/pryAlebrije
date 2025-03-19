const express = require('express');
const router = express.Router();
const calificacionController = require('../controllers/calificacionProductoController');

// Ruta para obtener la calificación promedio de un producto
router.get('/producto/:producto_id', calificacionController.obtenerCalificacionProducto);

// Ruta para agregar una nueva calificación a un producto
router.post('/producto', calificacionController.agregarCalificacionProducto);

module.exports = router;
