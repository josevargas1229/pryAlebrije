const { validationResult } = require('express-validator');
const { errorLogger } = require('../config/logger');
const { uploadImageToCloudinary } = require('../config/cloudinaryConfig');
const { Op } = require('sequelize');
const { Participacion, Premio, CuponUsuario, Ruleta,RuletaHistorial,RuletaPremio } = require('../models/associations');
exports.createRuleta = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { activo } = req.body;
    const files = req.files || [];

    try {
        // Validar que se enviaron ambas imágenes
        const imagenRuletaFile = files.find(file => file.fieldname === 'imagen_ruleta');
        const imagenBackgroundFile = files.find(file => file.fieldname === 'imagen_background');

        if (!imagenRuletaFile || !imagenBackgroundFile) {
            return res.status(400).json({ message: 'Se requieren imagen_ruleta e imagen_background' });
        }

        // Subir imágenes a Cloudinary
        const imagen_ruleta = await uploadImageToCloudinary(imagenRuletaFile);
        const imagen_background = await uploadImageToCloudinary(imagenBackgroundFile);

        // Crear ruleta
        const ruleta = await Ruleta.create({ imagen_ruleta, imagen_background, activo });

        // Registrar en historial
        await RuletaHistorial.create({
            ruleta_id: ruleta.id,
            imagen_ruleta,
            imagen_background,
            modificado_por: req.user.id
        });

        res.status(201).json(ruleta);
    } catch (error) {
        errorLogger.error(error);
        res.status(500).json({ message: 'Error al crear ruleta' });
    }
};

exports.getAllRuletas = async (req, res) => {
    try {
        const ruletas = await Ruleta.findAll();
        res.json(ruletas);
    } catch (error) {
        errorLogger.error(error);
        res.status(500).json({ message: 'Error al obtener ruletas' });
    }
};

exports.getRuletaById = async (req, res) => {
    try {
        const ruleta = await Ruleta.findByPk(req.params.id, {
            include: [{ model: RuletaPremio, as: 'segmentos' }]
        });
        if (!ruleta) return res.status(404).json({ message: 'Ruleta no encontrada' });
        res.json(ruleta);
    } catch (error) {
        errorLogger.error(error);
        res.status(500).json({ message: 'Error al obtener ruleta' });
    }
};

exports.updateRuleta = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { activo } = req.body;
    const files = req.files || [];

    try {
        const ruleta = await Ruleta.findByPk(req.params.id);
        if (!ruleta) return res.status(404).json({ message: 'Ruleta no encontrada' });

        // Preparar datos para actualizar
        const updateData = { activo: activo ?? ruleta.activo };
        const historialData = {
            ruleta_id: ruleta.id,
            imagen_ruleta: ruleta.imagen_ruleta,
            imagen_background: ruleta.imagen_background,
            modificado_por: req.user.id
        };

        // Procesar imágenes si se enviaron
        const imagenRuletaFile = files.find(file => file.fieldname === 'imagen_ruleta');
        const imagenBackgroundFile = files.find(file => file.fieldname === 'imagen_background');

        if (imagenRuletaFile) {
            updateData.imagen_ruleta = await uploadImageToCloudinary(imagenRuletaFile);
            historialData.imagen_ruleta = updateData.imagen_ruleta;
        }
        if (imagenBackgroundFile) {
            updateData.imagen_background = await uploadImageToCloudinary(imagenBackgroundFile);
            historialData.imagen_background = updateData.imagen_background;
        }

        // Actualizar ruleta
        await ruleta.update(updateData);

        // Registrar en historial
        await RuletaHistorial.create(historialData);

        res.json(ruleta);
    } catch (error) {
        errorLogger.error(error);
        res.status(500).json({ message: 'Error al actualizar ruleta' });
    }
};

exports.deleteRuleta = async (req, res) => {
    try {
        const ruleta = await Ruleta.findByPk(req.params.id);
        if (!ruleta) return res.status(404).json({ message: 'Ruleta no encontrada' });
        await ruleta.destroy();
        res.json({ message: 'Ruleta eliminada' });
    } catch (error) {
        errorLogger.error(error);
        res.status(500).json({ message: 'Error al eliminar ruleta' });
    }
};

exports.validateProbabilities = async (ruletaId) => {
    const premios = await RuletaPremio.findAll({ where: { ruleta_id: ruletaId } });
    const totalProbabilidad = premios.reduce((sum, premio) => sum + parseFloat(premio.probabilidad_pct), 0);
    if (totalProbabilidad > 100) {
        throw new Error('La suma de probabilidades excede el 100%');
    }
};

exports.restaurarDesdeHistorial = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const { historial_id } = req.body;
    try {
        const ruleta = await Ruleta.findByPk(id);
        if (!ruleta) return res.status(404).json({ message: 'Ruleta no encontrada' });

        const historial = await RuletaHistorial.findByPk(historial_id, { where: { ruleta_id: id } });
        if (!historial) return res.status(404).json({ message: 'Historial no encontrado' });

        await ruleta.update({
            imagen_ruleta: historial.imagen_ruleta,
            imagen_background: historial.imagen_background
        });

        await RuletaHistorial.create({
            ruleta_id: ruleta.id,
            imagen_ruleta: ruleta.imagen_ruleta,
            imagen_background: ruleta.imagen_background,
            modificado_por: req.user.id
        });

        res.json({ message: 'Diseño restaurado', ruleta });
    } catch (error) {
        errorLogger.error(error);
        res.status(500).json({ message: 'Error al restaurar' });
    }
};
exports.getHistorial = async (req, res) => {
    try {
        const { userId: userIdFromToken } = req.user || {};
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const historial = await Participacion.findAndCountAll({
            where: { usuario_id: userIdFromToken },
            include: [
                { model: Ruleta, as: 'ruleta', attributes: ['id', 'imagen_ruleta'] },
                { model: Premio, as: 'premio', attributes: ['id', 'nombre', 'descripcion', 'cantidad_a_descontar'] },
                { model: CuponUsuario, as: 'cupon', attributes: ['id', 'codigo', 'vence_el', 'estado', 'usado_en'] }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            total: historial.count,
            pages: Math.ceil(historial.count / limit),
            historial: historial.rows
        });
    } catch (error) {
        errorLogger.error(error);
        res.status(500).json({ message: 'Error al obtener historial', error: error.message });
    }
};