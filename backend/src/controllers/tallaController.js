const {Talla} = require('../models/associations');

exports.getTallas = async (req, res) => {
    try {
        const tallas = await Talla.findAll();
        res.json(tallas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createTalla = async (req, res) => {
    try {
        const { talla } = req.body;
        const nuevaTalla = await Talla.create({ talla });
        res.status(201).json(nuevaTalla);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};