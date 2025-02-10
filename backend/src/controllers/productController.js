const {Producto,Talla, ColorProducto} = require('../models/associations');

exports.createProducto = async (req, res) => {
    try {
        const { temporada_id, categoria_id, tipo_id, marca_id, talla_id, color_id, precio, stock, estado, calificacion } = req.body;

        // Verificar si la talla existe, si no, crearla
        let talla = await Talla.findByPk(talla_id);
        if (!talla) {
            talla = await Talla.create({ talla: talla_id });
        }

        // Verificar si el color existe, si no, crearlo
        let color = await ColorProducto.findByPk(color_id);
        if (!color) {
            color = await ColorProducto.create({ color: color_id });
        }

        // Crear el producto
        const nuevoProducto = await Producto.create({
            temporada_id,
            categoria_id,
            tipo_id,
            marca_id,
            talla_id: talla.id,
            color_id: color.id,
            precio,
            stock,
            estado,
            calificacion
        });

        res.status(201).json(nuevoProducto);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};