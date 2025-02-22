const sequelize = require('../config/database');
const { Product, Empleado, Temporada, Categoria, TipoProducto, Marca, Talla, ColorProducto, ProductoTallaColor } = require('../models/associations');

exports.createProducto = async (req, res) => {
    const transaction = await sequelize.transaction(); // Inicia la transacción
    try {
        // Obtener el usuario del token autenticado
        const { temporada_id, categoria_id, tipo_id, marca_id, variantes, precio, estado, calificacion } = req.body;
        const { userId: userIdFromToken } = req.user; // El ID del usuario que crea el producto

        // Obtener el ID del empleado relacionado con el usuario
        const empleado = await Empleado.findOne({
            where: { usuario_id: userIdFromToken },
            transaction
        });

        if (!empleado) {
            return res.status(404).json({ message: "Empleado no encontrado para este usuario." });
        }

        const createdBy = empleado.dataValues.id;

        // Crear el producto
        const nuevoProducto = await Product.create({
            temporada_id,
            categoria_id,
            tipo_id,
            marca_id,
            precio,
            estado,
            calificacion,
            created_by: createdBy, // Asignar el ID del empleado que crea el producto
            updated_by: createdBy, // Asignar el ID del empleado que hace la primera modificación
            created_at: new Date(), // Fecha de creación
            updated_at: new Date()  // Fecha de la primera modificación
        }, { transaction });

        let variantesParsed = Array.isArray(variantes) ? variantes : JSON.parse(variantes);
        // Manejar las variantes (cada una tiene talla, color y stock)
        if (variantesParsed && variantesParsed.length > 0) {
            for (const variante of variantesParsed) {
                const { talla_id, color_id, stock } = variante;
                let talla = await Talla.findByPk(talla_id, { transaction });
                let color = await ColorProducto.findByPk(color_id, { transaction });
                // Guardar la relación en la tabla intermedia con el stock
                await ProductoTallaColor.create({
                    producto_id: nuevoProducto.id,
                    talla_id: talla.id,
                    color_id: color.id,
                    stock
                }, { transaction });
            }
        }

        await transaction.commit(); // Confirma la transacción si todo salió bien
        res.status(201).json({
            message: "Producto creado con éxito",
            producto: nuevoProducto
        });

    } catch (error) {
        await transaction.rollback(); // Revierte la transacción en caso de error
        console.error('Error al crear el producto:', error); // Agregar más detalle en el log de error
        res.status(400).json({ message: "Error al crear el producto", error: error.message });
    }
};



exports.getAllFilters = async (req, res) => {
    try {
        const [temporadas, categorias, tipos, marcas, tallas, colores] = await Promise.all([
            Temporada.findAll(),
            Categoria.findAll(),
            TipoProducto.findAll(),
            Marca.findAll(),
            Talla.findAll(),
            ColorProducto.findAll()
        ]);

        res.status(200).json({
            temporadas,
            categorias,
            tipos,
            marcas,
            tallas,
            colores
        });

    } catch (error) {
        res.status(500).json({ message: "Error al obtener los datos", error: error.message });
    }
};
exports.getAllProductos = async (req, res) => {
    const { page = 1 } = req.query;  // Por defecto, página 1 y 10 productos por página
    const pageSize = parseInt(req.query.pageSize, 10);

    // Calcular el offset según la página
    const offset = (page - 1) * pageSize;

    try {
        // Obtener los productos con limitación y desplazamiento
        const productos = await Product.findAll({
            limit: pageSize,
            offset: offset,
            include: [
                { model: Temporada },
                { model: Categoria },
                { model: TipoProducto },
                { model: Marca }
            ]
        });

        res.json({
            productos,
            currentPage: page,
            pageSize: pageSize
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener productos' });
    }
};