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
            Temporada.findAll({ order: [['temporada', 'ASC']] }),
            Categoria.findAll({ order: [['nombre', 'ASC']] }),
            TipoProducto.findAll({ order: [['nombre', 'ASC']] }),
            Marca.findAll({ order: [['nombre', 'ASC']] }),
            Talla.findAll({ order: [['talla', 'ASC']] }),
            ColorProducto.findAll({ order: [['color', 'ASC']] })
        ]);

        res.status(200).json({ temporadas, categorias, tipos, marcas, tallas, colores });

    } catch (error) {
        res.status(500).json({ message: "Error al obtener los datos", error: error.message });
    }
};
exports.getAllProductos = async (req, res) => {
    const { page = 1, pageSize = 10, temporada_id, categoria_id, tipo_id, marca_id, color_id, talla_id } = req.query;

    const offset = (page - 1) * pageSize;
    const whereCondition = { is_deleted: false };

    // Aplicar filtros si están presentes en la solicitud
    if (temporada_id) whereCondition.temporada_id = temporada_id;
    if (categoria_id) whereCondition.categoria_id = categoria_id;
    if (tipo_id) whereCondition.tipo_id = tipo_id;
    if (marca_id) whereCondition.marca_id = marca_id;

    try {
        const productos = await Product.findAll({
            where: whereCondition,
            limit: parseInt(pageSize),
            offset,
            include: [
                { model: Temporada },
                { model: Categoria },
                { model: TipoProducto },
                { model: Marca },
                {
                    model: ProductoTallaColor,
                    include: [
                        { model: Talla },
                        { model: ColorProducto }
                    ]
                }
            ]
        });

        // Filtrar por color o talla después de obtener los productos si es necesario
        let productosFiltrados = productos;

        if (color_id) {
            productosFiltrados = productosFiltrados.filter(producto =>
                producto.ProductoTallaColors.some(ptc => ptc.color_id == color_id)
            );
        }

        if (talla_id) {
            productosFiltrados = productosFiltrados.filter(producto =>
                producto.ProductoTallaColors.some(ptc => ptc.talla_id == talla_id)
            );
        }

        res.json({
            productos: productosFiltrados,
            currentPage: page,
            pageSize: pageSize
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener productos' });
    }
};

exports.updateProducto = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { temporada_id, categoria_id, tipo_id, marca_id, variantes, precio, estado, calificacion } = req.body;
        const { userId: userIdFromToken } = req.user;

        const empleado = await Empleado.findOne({
            where: { usuario_id: userIdFromToken },
            transaction
        });

        if (!empleado) {
            return res.status(404).json({ message: "Empleado no encontrado para este usuario." });
        }

        const updatedBy = empleado.dataValues.id;

        const producto = await Product.findByPk(id, { transaction });
        if (!producto) {
            return res.status(404).json({ message: "Producto no encontrado." });
        }

        await producto.update({
            temporada_id,
            categoria_id,
            tipo_id,
            marca_id,
            precio,
            estado,
            calificacion,
            updated_by: updatedBy,
            updated_at: new Date()
        }, { transaction });

        let variantesParsed = Array.isArray(variantes) ? variantes : JSON.parse(variantes);
        if (variantesParsed && variantesParsed.length > 0) {
            const existingVariantes = await ProductoTallaColor.findAll({
                where: { producto_id: id },
                transaction
            });

            const existingMap = new Map(existingVariantes.map(v => [`${v.talla_id}-${v.color_id}`, v]));

            for (const variante of variantesParsed) {
                const { talla_id, color_id, stock } = variante;
                const key = `${talla_id}-${color_id}`;

                if (existingMap.has(key)) {
                    await existingMap.get(key).update({ stock }, { transaction });
                    existingMap.delete(key);
                } else {
                    await ProductoTallaColor.create({
                        producto_id: id,
                        talla_id,
                        color_id,
                        stock
                    }, { transaction });
                }
            }

            for (const [, variante] of existingMap) {
                await variante.destroy({ transaction });
            }
        }

        await transaction.commit();
        res.status(200).json({ message: "Producto actualizado con éxito." });
    } catch (error) {
        await transaction.rollback();
        console.error('Error al actualizar el producto:', error);
        res.status(400).json({ message: "Error al actualizar el producto", error: error.message });
    }
};

exports.getProductoById = async (req, res) => {
    try {
        const { id } = req.params;

        const producto = await Product.findByPk(id, {
            attributes: {
                exclude: ['created_by', 'updated_by', 'deleted_by', 'deleted_at', 'is_deleted']
            },
            include: [
                { model: Temporada, attributes: ['id', 'temporada'] },
                { model: Categoria, attributes: ['id', 'nombre'] },
                { model: TipoProducto, attributes: ['id', 'nombre'] },
                { model: Marca, attributes: ['id', 'nombre'] },
                {
                    model: ProductoTallaColor,
                    attributes: ['id', 'producto_id', 'talla_id', 'color_id', 'stock'],
                    include: [
                        { model: Talla, attributes: ['id', 'talla'] },
                        { model: ColorProducto, attributes: ['id', 'color', 'colorHex'] }
                    ]
                }
            ]
        });

        if (!producto) {
            return res.status(404).json({ message: "Producto no encontrado." });
        }

        // Transformar los nombres antes de enviarlos al frontend
        const productoTransformado = {
            id: producto.id,
            temporada: producto.Temporada ? { id: producto.Temporada.id, temporada: producto.Temporada.temporada } : null,
            categoria: producto.Categorium ? { id: producto.Categorium.id, nombre: producto.Categorium.nombre } : null,
            tipo: producto.TipoProducto ? { id: producto.TipoProducto.id, nombre: producto.TipoProducto.nombre } : null,
            marca: producto.Marca ? { id: producto.Marca.id, nombre: producto.Marca.nombre } : null,
            precio: producto.precio,
            estado: producto.estado,
            calificacion: producto.calificacion,
            created_at: producto.created_at,
            updated_at: producto.updated_at,
            tallasColoresStock: producto.ProductoTallaColors ? producto.ProductoTallaColors.map(ptc => ({
                id: ptc.id,
                producto_id: ptc.producto_id,
                stock: ptc.stock,
                talla: ptc.Talla ? { id: ptc.Talla.id, talla: ptc.Talla.talla } : null,
                coloresStock: ptc.ColorProducto ? { id: ptc.ColorProducto.id, color: ptc.ColorProducto.color, colorHex: ptc.ColorProducto.colorHex } : null
            })) : []
        };

        res.status(200).json({ producto: productoTransformado });
    } catch (error) {
        console.error('Error al obtener el producto:', error);
        res.status(500).json({ message: "Error al obtener el producto", error: error.message });
    }
};

exports.deleteProducto = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params; // ID del producto a eliminar
        const { userId: userIdFromToken } = req.user; // ID del usuario autenticado desde el token

        // Obtener el empleado relacionado con el usuario autenticado
        const empleado = await Empleado.findOne({
            where: { usuario_id: userIdFromToken },
            transaction
        });

        if (!empleado) {
            await transaction.rollback();
            return res.status(404).json({ message: "Empleado no encontrado para este usuario." });
        }

        const deletedBy = empleado.id;

        // Buscar el producto por ID
        const producto = await Product.findByPk(id, { transaction });
        if (!producto) {
            await transaction.rollback();
            return res.status(404).json({ message: "Producto no encontrado." });
        }

        // Verificar si ya está eliminado
        if (producto.is_deleted) {
            await transaction.rollback();
            return res.status(400).json({ message: "El producto ya está marcado como eliminado." });
        }

        // Realizar la eliminación lógica
        await producto.update({
            is_deleted: true,
            deleted_at: new Date(),
            deleted_by: deletedBy
        }, { transaction });

        await transaction.commit();
        res.status(200).json({ message: "Producto eliminado lógicamente con éxito." });
    } catch (error) {
        await transaction.rollback();
        console.error('Error al eliminar el producto:', error);
        res.status(500).json({ message: "Error al eliminar el producto", error: error.message });
    }
};

exports.getDeletedProductos = async (req, res) => {
    const { page = 1, pageSize = 10 } = req.query; // Paginación opcional
    const offset = (page - 1) * pageSize;

    try {
        const productosEliminados = await Product.findAll({
            where: { is_deleted: true }, // Filtrar solo productos eliminados
            limit: parseInt(pageSize, 10),
            offset: offset,
            attributes: {
                exclude: ['created_by', 'updated_by'] // Excluir campos sensibles si no son necesarios
            },
            include: [
                { model: Temporada, attributes: ['id', 'temporada'] },
                { model: Categoria, attributes: ['id', 'nombre'] },
                { model: TipoProducto, attributes: ['id', 'nombre'] },
                { model: Marca, attributes: ['id', 'nombre'] },
                {
                    model: ProductoTallaColor,
                    attributes: ['id', 'producto_id', 'talla_id', 'color_id', 'stock'],
                    include: [
                        { model: Talla, attributes: ['id', 'talla'] },
                        { model: ColorProducto, attributes: ['id', 'color', 'colorHex'] }
                    ]
                }
            ]
        });

        // Transformar los datos para la respuesta
        const productosTransformados = productosEliminados.map(producto => ({
            id: producto.id,
            nombre_producto: `${producto.TipoProducto.nombre} ${producto.Marca.nombre} ${producto.Categorium.nombre}`,
            temporada: producto.Temporada ? { id: producto.Temporada.id, temporada: producto.Temporada.temporada } : null,
            categoria: producto.Categorium ? { id: producto.Categorium.id, nombre: producto.Categorium.nombre } : null,
            tipo: producto.TipoProducto ? { id: producto.TipoProducto.id, nombre: producto.TipoProducto.nombre } : null,
            marca: producto.Marca ? { id: producto.Marca.id, nombre: producto.Marca.nombre } : null,
            precio: producto.precio,
            estado: producto.estado,
            calificacion: producto.calificacion,
            created_at: producto.created_at,
            updated_at: producto.updated_at,
            deleted_at: producto.deleted_at,
            deleted_by: producto.deleted_by,
            tallasColoresStock: producto.ProductoTallaColors ? producto.ProductoTallaColors.map(ptc => ({
                id: ptc.id,
                producto_id: ptc.producto_id,
                stock: ptc.stock,
                talla: ptc.Talla ? { id: ptc.Talla.id, talla: ptc.Talla.talla } : null,
                coloresStock: ptc.ColorProducto ? { id: ptc.ColorProducto.id, color: ptc.ColorProducto.color, colorHex: ptc.ColorProducto.colorHex } : null
            })) : []
        }));

        res.status(200).json({
            productos: productosTransformados,
            currentPage: parseInt(page, 10),
            pageSize: parseInt(pageSize, 10)
        });
    } catch (error) {
        console.error('Error al obtener productos eliminados:', error);
        res.status(500).json({ message: 'Error al obtener productos eliminados', error: error.message });
    }
};
exports.restoreProducto = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { userId: userIdFromToken } = req.user;

        const empleado = await Empleado.findOne({
            where: { usuario_id: userIdFromToken },
            transaction
        });

        if (!empleado) {
            await transaction.rollback();
            return res.status(404).json({ message: "Empleado no encontrado para este usuario." });
        }

        const updatedBy = empleado.id;

        const producto = await Product.findByPk(id, { transaction });
        if (!producto) {
            await transaction.rollback();
            return res.status(404).json({ message: "Producto no encontrado." });
        }

        if (!producto.is_deleted) {
            await transaction.rollback();
            return res.status(400).json({ message: "El producto no está marcado como eliminado." });
        }

        await producto.update({
            is_deleted: false,
            deleted_at: null,
            deleted_by: null,
            updated_by: updatedBy,
            updated_at: new Date()
        }, { transaction });

        await transaction.commit();
        res.status(200).json({ message: "Producto restaurado con éxito." });
    } catch (error) {
        await transaction.rollback();
        console.error('Error al restaurar el producto:', error);
        res.status(500).json({ message: "Error al restaurar el producto", error: error.message });
    }
};