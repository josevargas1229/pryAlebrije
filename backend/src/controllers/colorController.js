const {ColorProducto} = require('../models/associations');

exports.getColores = async (req, res) => {
    try {
        const colores = await ColorProducto.findAll();
        res.json(colores);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createColor = async (req, res) => {
    try {
        const { color, colorHex } = req.body;
        const nuevoColor = await ColorProducto.create({ color, colorHex });
        res.status(201).json(nuevoColor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.updateColor = async (req, res) => {
    try {
        const { id } = req.params;
        const { color, colorHex } = req.body;
        const colorExistente = await ColorProducto.findByPk(id);
        if (!colorExistente) {
            return res.status(404).json({ message: 'Color no encontrado' });
        }
        await colorExistente.update({ color, colorHex });
        res.json(colorExistente);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};