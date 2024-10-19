const User = require('../models/User');
const EmailType = require('../models/EmailType');
const EmailTemplate = require('../models/EmailTemplate');

exports.getAllTemplates = async (req, res) => {
    try {
        const templates = await EmailTemplate.findAll({
            include: [
                { model: EmailType, as: 'tipo', attributes: ['codigo', 'nombre'] },
                { model: User, as: 'creador', attributes: ['nombre', 'email'] }
            ]
        });
        res.json({ data: templates });
    } catch (error) {
        console.error('Error al obtener plantillas de email:', error);
        res.status(500).json({ error: 'Error al obtener las plantillas de email' });
    }
};

exports.getTemplateById = async (req, res) => {
    try {
        const template = await EmailTemplate.findByPk(req.params.id, {
            include: [
                { model: EmailType, as: 'tipo', attributes: ['codigo', 'nombre'] },
                { model: User, as: 'creador', attributes: ['nombre', 'email'] }
            ]
        });
        
        if (!template) {
            return res.status(404).json({ error: 'Plantilla de email no encontrada' });
        }
        
        res.json({ data: template });
    } catch (error) {
        console.error('Error al obtener plantilla de email:', error);
        res.status(500).json({ error: 'Error al obtener la plantilla de email' });
    }
};

exports.createTemplate = async (req, res) => {
    const { nombre, tipo_id, asunto, contenido_html, contenido_texto, variables } = req.body;

    // Validaciones básicas
    if (!nombre || !tipo_id || !asunto || !contenido_html || !contenido_texto || !variables) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    try {
        const template = await EmailTemplate.create({
            nombre,
            tipo_id,
            asunto,
            contenido_html,
            contenido_texto,
            variables,
            creado_por: req.user.userId
        });

        res.status(201).json({ message: 'Plantilla de email creada correctamente', data: template });
    } catch (error) {
        console.error('Error al crear plantilla de email:', error);
        res.status(500).json({ error: 'Error al crear la plantilla de email' });
    }
};

exports.updateTemplate = async (req, res) => {
    const { id } = req.params;
    const { nombre, tipo_id, asunto, contenido_html, contenido_texto, variables, activo } = req.body;
    console.log("1")
    // Validaciones básicas
    if (!nombre && !tipo_id && !asunto && !contenido_html && !contenido_texto && !variables && activo === undefined) {
        return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
    }
    console.log("2")
    try {
        const template = await EmailTemplate.findByPk(id);
        
        if (!template) {
            return res.status(404).json({ error: 'Plantilla de email no encontrada' });
        }
        console.log("3")
        await template.update({
            nombre,
            tipo_id,
            asunto,
            contenido_html,
            contenido_texto,
            variables,
            activo
        });

        res.json({ message: 'Plantilla de email actualizada correctamente', data: template });
    } catch (error) {
        console.error('Error al actualizar plantilla de email:', error);
        res.status(500).json({ error: 'Error al actualizar la plantilla de email' });
    }
};

exports.deleteTemplate = async (req, res) => {
    try {
        const template = await EmailTemplate.findByPk(req.params.id);
        
        if (!template) {
            return res.status(404).json({ error: 'Plantilla de email no encontrada' });
        }

        await template.destroy();
        res.json({ message: 'Plantilla de email eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar plantilla de email:', error);
        res.status(500).json({ error: 'Error al eliminar la plantilla de email' });
    }
};
