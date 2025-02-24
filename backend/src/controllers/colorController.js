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