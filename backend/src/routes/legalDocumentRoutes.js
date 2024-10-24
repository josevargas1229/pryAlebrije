const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path'); // Asegúrate de importar el módulo 'path'
const legalDocumentController = require('../controllers/legalDocumentController');
const { authenticateToken, authorize } = require('../middlewares/auth');

// Configuración de Multer
const upload = multer({
  dest: 'uploads/', // Directorio para almacenar archivos subidos
  fileFilter: (req, file, cb) => {
    const filetypes = /doc|docx/; // Tipos de archivo permitidos
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase()); // Usando 'path' correctamente

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Error: Tipo de archivo no soportado'));
  },
});

// Rutas para documentos legales
router.post('/upload', upload.single('file'), legalDocumentController.uploadDocument);
router.get('/documents/:tipo', legalDocumentController.getDocumentsByType);

// Crear y gestionar documentos legales
router.post('/create', authenticateToken, authorize('admin'), legalDocumentController.createLegalDocument);
router.post('/terms', authenticateToken, authorize('admin'), legalDocumentController.createTerms);
router.post('/privacy', authenticateToken, authorize('admin'), legalDocumentController.createPrivacyPolicy);
router.post('/disclaimer', authenticateToken, authorize('admin'), legalDocumentController.createDisclaimer);

// Rutas para editar documentos
router.put('/edit', authenticateToken, authorize('admin'), legalDocumentController.editDocument);

module.exports = router;
