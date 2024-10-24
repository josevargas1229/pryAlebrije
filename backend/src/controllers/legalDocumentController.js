const LegalDocument = require('../models/LegalDocument');
const mammoth = require('mammoth');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

// Configuración de Multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Renombrar el archivo
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /doc|docx/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Error: Tipo de archivo no soportado'));
  },
}).single('file'); // Asumiendo que solo subes un archivo

// Subir y convertir documento
exports.uploadDocument = async (req, res) => {
  // Llama a Multer para manejar la subida de archivos
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    }

    const filePath = req.file.path;
    const { tipo, usuario } = req.body;

    try {
      // Convertir el archivo de Word a HTML
      const result = await mammoth.convertToHtml({ path: filePath });
      const htmlContent = result.value;
      const fileName = req.file.originalname;

      // Actualizar los documentos anteriores a no vigentes
      await LegalDocument.update(
        { vigente: false },
        { where: { tipo } }
      );

      // Guardar el nuevo documento como vigente
      const newDocument = await LegalDocument.create({
        nombre: fileName,
        contenido_html: htmlContent,
        tipo,
        vigente: true,
        modificado_por: usuario,
      });

      res.status(200).json({ message: 'Documento subido exitosamente', document: newDocument });
    } catch (error) {
      console.error('Error al subir el documento:', error);
      res.status(500).json({ error: error.message || 'Error al subir el documento' });
    } finally {
      // Eliminar el archivo temporal
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Error al eliminar el archivo temporal:', err);
      }
    }
  });
};

// Obtener todos los documentos de un tipo específico
exports.getDocumentsByType = async (req, res) => {
  const tipo = req.params.tipo;

  try {
    const documents = await LegalDocument.findAll({
      where: { tipo },
      attributes: ['id', 'nombre', 'contenido_html', 'tipo', 'fecha_creacion', 'vigente', 'modificado_por'],
    });

    if (documents.length === 0) {
      return res.status(404).json({ error: 'No se encontraron documentos para el tipo especificado' });
    }

    const formattedDocuments = documents.map(doc => ({
      ...doc.dataValues,
      fecha_creacion: new Date(doc.fecha_creacion).toLocaleString(),
    }));

    res.status(200).json(formattedDocuments);
  } catch (error) {
    console.error('Error al obtener documentos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Editar documento
exports.editDocument = async (req, res) => {
  const { id, content, usuario } = req.body;

  try {
    const [updated] = await LegalDocument.update(
      { contenido_html: content, modificado_por: usuario },
      { where: { id } }
    );

    if (updated) {
      const updatedDocument = await LegalDocument.findOne({ where: { id } });
      return res.status(200).json({ document: updatedDocument });
    }
    throw new Error('Documento no encontrado');
  } catch (error) {
    res.status(500).json({ error: 'Error al editar el documento' });
  }
};

// Crear documento legal (general)
exports.createLegalDocument = async (req, res) => {
  const { tipo, contenido_html, usuario } = req.body;

  try {
    const newDocument = await LegalDocument.create({
      contenido_html,
      tipo,
      vigente: true,
      modificado_por: usuario,
    });

    res.status(201).json({ message: 'Documento legal creado exitosamente', document: newDocument });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear documento legal' });
  }
};

// Crear documento de términos y condiciones
exports.createTerms = async (req, res) => {
  try {
    res.status(200).json({ message: 'Términos y condiciones creados exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear términos y condiciones' });
  }
};

// Crear política de privacidad
exports.createPrivacyPolicy = async (req, res) => {
  try {
    res.status(200).json({ message: 'Política de privacidad creada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear política de privacidad' });
  }
};

// Crear deslinde legal
exports.createDisclaimer = async (req, res) => {
  try {
    res.status(200).json({ message: 'Deslinde legal creado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear deslinde legal' });
  }
};
