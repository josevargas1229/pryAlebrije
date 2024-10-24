const express = require('express');
const router = express.Router();
const companyProfileController = require('../controllers/companyProfileController');
const multer = require('multer');

// Configuración de Multer para cargar el logo
const storage = multer.memoryStorage(); // Cambiamos a almacenamiento en memoria para usar buffer
const upload = multer({ storage });

router.get('', companyProfileController.getCompanyProfile);
router.put('', upload.single('logo'), companyProfileController.updateCompanyProfile);

module.exports = router;
