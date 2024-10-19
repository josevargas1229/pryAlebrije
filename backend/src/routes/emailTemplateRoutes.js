const express = require('express');
const router = express.Router();
const emailTemplateController = require('../controllers/emailTemplateController');
const { authenticateToken } = require('../middlewares/auth');

// Obtener todas las plantillas de email
router.get('/', emailTemplateController.getAllTemplates);

// Obtener una plantilla de email por ID
router.get('/:id', emailTemplateController.getTemplateById);

// Crear una nueva plantilla de email
router.post('/',authenticateToken, emailTemplateController.createTemplate);

// Actualizar una plantilla de email por ID
router.put('/:id', emailTemplateController.updateTemplate);

// Eliminar una plantilla de email por ID
router.delete('/:id', emailTemplateController.deleteTemplate);

module.exports = router;
