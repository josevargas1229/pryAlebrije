const { Categoria } = require('../models/associations');

exports.getCategorias = async (req, res) => {
    try {
        const categorias = await Categoria.findAll();
        res.json(categorias);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createCategoria = async (req, res) => {
    try {
        const { nombre } = req.body;
        const nuevaCategoria = await Categoria.create({ nombre });
        res.status(201).json(nuevaCategoria);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;
        const categoriaExistente = await Categoria.findByPk(id);
        if (!categoriaExistente) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }
        await categoriaExistente.update({ nombre });
        res.json(categoriaExistente);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};