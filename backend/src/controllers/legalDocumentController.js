const LegalDocument = require('../models/LegalDocument');
const mammoth = require('mammoth');
const fs = require('fs');
const sanitizeHtml = require('sanitize-html'); 
// Subir y convertir documento
exports.uploadDocument = async (req, res) => {
  const { tipo, usuario } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'No se ha subido ningún archivo' });
  }

  const filePath = req.file.path;
  const fileName = req.file.originalname;

  // Comprobación de la extensión del archivo
  if (!fileName.endsWith('.docx')) {
    // Eliminar el archivo no válido
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error al eliminar el archivo no válido:', err);
      }
    });
    return res.status(400).json({ error: 'Solo se permiten archivos de tipo .docx' });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(400).json({ error: 'El archivo subido no existe' });
  }

  try {
    // Convertir el archivo de Word a HTML
    const result = await mammoth.convertToHtml({ path: filePath });
    const originalContent = result.value;
    
    // Sanitizar el contenido HTML para evitar inyección de código malicioso
    const sanitizedContent =sanitizeHtml(originalContent, {
      allowedTags: [ 'p', 'a', 'strong', 'em', 'ul', 'ol', 'li', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'tr', 'td', 'th','img' ],
      allowedAttributes: {
        a: [ 'href', 'name', 'target' ],
        img: [ 'src', 'srcset', 'alt', 'title', 'width', 'height', 'loading' ]
      },
    });
    if (sanitizedContent !== originalContent) {
      return res.status(400).json({
        error: 'El contenido incluía elementos no permitidos, y se eliminaron antes de guardar.',
        sanitizedContent // Puedes enviar el contenido sanitizado si deseas mostrarlo
      });
    }
    // Actualizar los documentos anteriores a no vigentes
    await LegalDocument.update({ vigente: false }, { where: { tipo } });

    // Guardar el nuevo documento como vigente
    const newDocument = await LegalDocument.create({
      nombre: fileName,
      contenido_html: sanitizedContent,
      tipo,
      vigente: true,
      modificado_por: usuario,
    });

    res.status(200).json({ message: 'Documento subido exitosamente', document: newDocument });
  } catch (error) {
    console.error('Error al subir el documento:', error);
    res.status(500).json({ error: error.message || 'Error al subir el documento' });
  } finally {
    // Eliminar el archivo temporal de forma asíncrona
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error al eliminar el archivo temporal:', err);
      }
    });
  }
};

// Obtener todos los documentos de un tipo específico
exports.getDocumentsByType = async (req, res) => {
  const tipo = req.params.tipo;

  try {
    const documents = await LegalDocument.findAll({
      where: {
        tipo,
        vigente: true,
      },
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

exports.getAllDocumentsByType = async (req, res) => {
  const tipo = req.params.tipo;

  try {
    const documents = await LegalDocument.findAll({
      where: {
        tipo
      },
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