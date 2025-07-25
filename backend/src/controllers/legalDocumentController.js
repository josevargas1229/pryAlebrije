const { LegalDocument } = require('../models/associations');

const mammoth = require('mammoth');
const fs = require('fs');
const sanitizeHtml = require('sanitize-html');
const he = require('he');

function isSuspiciousContent(content) {
  // Limitar el tamaño del contenido para prevenir ataques DoS
  if (content.length > 10000) {
    return true; // Rechazar contenido excesivamente largo
  }

  // Sanitizar el contenido y compararlo con el original
  const cleanContent = sanitizeHtml(content, {
    allowedTags: [], // No permitir ninguna etiqueta
    allowedAttributes: {}, // No permitir atributos
  });

  // Si el contenido limpio es diferente del original, asumimos que había HTML sospechoso
  return content !== cleanContent;
}


// Subir y convertir documento
exports.uploadDocument = async (req, res) => {
  const { tipo, usuario } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'No se ha subido ningún archivo' });
  }

  const filePath = req.file.path;
  const fileName = req.file.originalname;

  if (!fileName.endsWith('.docx')) {
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error al eliminar el archivo no válido:', err);
    });
    return res.status(400).json({ error: 'Solo se permiten archivos de tipo .docx' });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(400).json({ error: 'El archivo subido no existe' });
  }

  try {
    const result = await mammoth.convertToHtml({ path: filePath });
    var originalContent = result.value;
    let iteration = 0;
    var previousContent = '';
    let contentsContentSuspicious=false;
    // Ciclo para limpiar y verificar contenido
    do {
      iteration++;
      previousContent = originalContent;
      contentsContentSuspicious= isSuspiciousContent(originalContent);
      if(contentsContentSuspicious){
        break;
      }

      originalContent = sanitizeHtml(originalContent, {
        allowedTags: [],
        allowedAttributes: {},
      });
      originalContent = he.decode(originalContent);
    } while ( iteration < 10);
    if(contentsContentSuspicious){
      return res.status(400).json({ error: 'El contenido del archivo es sospechoso.' });
    }
    // Actualizar documentos del mismo tipo a no vigentes
    await LegalDocument.update({ vigente: false }, { where: { tipo } });

    // Obtener la última versión de este tipo de documento
    const latestDocument = await LegalDocument.findOne({
      where: { tipo },
      order: [['version', 'DESC']],
    });

    // Calcular la nueva versión
    const newVersion = latestDocument ? parseFloat(latestDocument.version) + 1.0 : 1.0;

    const newDocument = await LegalDocument.create({
      nombre: fileName,
      contenido_html: originalContent,
      tipo,
      vigente: true,
      modificado_por: usuario,
      version: newVersion,
      eliminado: false,
    });

    res.status(200).json({ message: 'Documento subido exitosamente', document: newDocument });
  } catch (error) {
    console.error('Error al subir el documento:', error);
    res.status(500).json({ error: error.message || 'Error al subir el documento' });
  } finally {
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error al eliminar el archivo temporal:', err);
    });
  }
};

// Obtener todos los documentos de un tipo específico
exports.getDocumentsByType = async (req, res) => {
  const tipo = req.params.tipo.trim().toLowerCase();
  console.log('>>> Buscando documentos de tipo:', tipo); // log clave

  try {
    const documents = await LegalDocument.findAll({
      where: {
        tipo,
        vigente: true,
        eliminado: false,
      },
    });

    console.log('>>> Documentos encontrados:', documents.length); // log clave

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
exports.modifyDocument = async (req, res) => {
  const { id } = req.params;
  const { usuario } = req.body;
  const nuevoContenido = req.body.contenido_html;

  try {
    // Obtener el documento actual
    const document = await LegalDocument.findByPk(id);
    if (!document) return res.status(404).json({ error: 'Documento no encontrado' });

    // Sanitizar el nuevo contenido antes de guardarlo
    const sanitizedContent = sanitizeHtml(nuevoContenido, {
      allowedTags: ['b', 'i', 'u', 'strong', 'em', 'a', 'p', 'ul', 'ol', 'li', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre', 'img'],
      allowedAttributes: {
        '*': ['style', 'class'],
        'a': ['href', 'target'],
        'img': ['src', 'alt', 'width', 'height']
      }
    });
    // Verificar si hay un documento vigente del mismo tipo
    const existingVigenteDocument = await LegalDocument.findOne({
      where: {
        tipo: document.tipo,
        vigente: true,
      }
    });
    if (!existingVigenteDocument) {
      await document.update({ vigente: false });
    } else{
      await existingVigenteDocument.update({vigente:false});
    }

    // Crear una nueva versión del documento con el nuevo contenido
    const newVersion = (parseFloat(document.version) + 0.1).toFixed(1); // Formatear la nueva versión a un decimal con 1 dígito
    const newDocument = await LegalDocument.create({
      nombre: document.nombre,
      contenido_html: sanitizedContent,
      tipo: document.tipo,
      vigente: true,
      modificado_por: usuario,
      version: newVersion,
      eliminado: false,
    });

    res.status(200).json({ message: 'Documento modificado y nueva versión creada', document: newDocument });
  } catch (error) {
    console.error('Error al modificar el documento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.deleteDocument = async (req, res) => {
  const { id } = req.params;

  try {
    const document = await LegalDocument.findByPk(id);
    if (!document) return res.status(404).json({ error: 'Documento no encontrado' });

    // Marcar el documento como eliminado
    await document.update({ eliminado: true, vigente: false });

    res.status(200).json({ message: 'Documento marcado como eliminado' });
  } catch (error) {
    console.error('Error al eliminar el documento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
