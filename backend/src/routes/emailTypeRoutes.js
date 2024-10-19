const express = require('express');
const router = express.Router();
const emailTypeController = require('../controllers/emailTypeController');
const { authenticateToken } = require('../middlewares/auth');

// Obtener todos los tipos de email
router.get('/', emailTypeController.getAllTypes);

// Obtener un tipo de email por ID
router.get('/:id', emailTypeController.getTypeById);

// Crear un nuevo tipo de email
router.post('/',authenticateToken, emailTypeController.createType);

// Actualizar un tipo de email por ID
router.put('/:id', emailTypeController.updateType);

// Eliminar un tipo de email por ID
router.delete('/:id', emailTypeController.deleteType);

module.exports = router;
