const sequelize = require('../config/database');
const { Product, Empleado, Temporada, Categoria, TipoProducto, Marca, Talla, ColorProducto, ProductoTallaColor, ImagenProducto } = require('../models/associations');
const { Op } = require('sequelize');
const { uploadImageToCloudinary } = require('../config/cloudinaryConfig');

exports.createProducto = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        // Obtener datos del request
        const { temporada_id, categoria_id, tipo_id, marca_id, variantes, precio, estado, calificacion } = req.body;
        const { userId: userIdFromToken } = req.user;

        // Obtener empleado
        const empleado = await Empleado.findOne({
            where: { usuario_id: userIdFromToken },
            transaction
        });

        if (!empleado) {
            await transaction.rollback();
            return res.status(404).json({ message: "Empleado no encontrado para este usuario." });
        }

        const createdBy = empleado.id;

        // Crear el producto
        const nuevoProducto = await Product.create({
            temporada_id,
            categoria_id,
            tipo_id,
            marca_id,
            precio,
            estado,
            calificacion,
            created_by: createdBy,
            updated_by: createdBy,
            created_at: new Date(),
            updated_at: new Date()
        }, { transaction });

        // Parsear variantes
        let variantesParsed = Array.isArray(variantes) ? variantes : JSON.parse(variantes);

        // Manejar variantes y sus imágenes
        if (variantesParsed && variantesParsed.length > 0) {
            for (const variante of variantesParsed) {
                const { talla_id, color_id, stock, imagenes } = variante;

                // Validar talla y color
                const talla = await Talla.findByPk(talla_id, { transaction });
                const color = await ColorProducto.findByPk(color_id, { transaction });

                if (!talla || !color) {
                    await transaction.rollback();
                    return res.status(400).json({ message: "Talla o color inválido" });
                }

                // Guardar relación producto-talla-color
                await ProductoTallaColor.create({
                    producto_id: nuevoProducto.id,
                    talla_id: talla.id,
                    color_id: color.id,
                    stock
                }, { transaction });
            }
        }
        // Manejar imágenes si existen
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                // Extraer color_id del nombre del campo (ejemplo: "imagenes[1][0]" -> color_id: 1)
                const match = file.fieldname.match(/imagenes\[(\d+)\]/);
                if (match) {
                    const color_id = parseInt(match[1], 10);
                    const imagenUrl = await uploadImageToCloudinary(file);
                    await ImagenProducto.create({
                        producto_id: nuevoProducto.id,
                        color_id,
                        imagen_url: imagenUrl
                    }, { transaction });
                }
            }
        }

        await transaction.commit();
        res.status(201).json({
            message: "Producto creado con éxito",
            producto: nuevoProducto
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Error al crear el producto:', error);
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
    const { page = 1, pageSize = 10, estado, categoria_id, tipo_id, marca_id, talla_id, color_id, search } = req.query;
    const offset = (page - 1) * pageSize;
    const whereCondition = { is_deleted: false };

    if (estado) whereCondition.estado = estado === 'true';

    // Manejar filtros como arreglos o valores únicos
    if (categoria_id) {
        whereCondition.categoria_id = Array.isArray(categoria_id) ? { [Op.in]: categoria_id } : categoria_id;
    }
    if (tipo_id) {
        whereCondition.tipo_id = Array.isArray(tipo_id) ? { [Op.in]: tipo_id } : tipo_id;
    }
    if (marca_id) {
        whereCondition.marca_id = Array.isArray(marca_id) ? { [Op.in]: marca_id } : marca_id;
    }

    try {
        const { count, rows } = await Product.findAndCountAll({
            where: whereCondition,
            limit: parseInt(pageSize),
            offset,
            attributes: ['id', 'precio', 'estado'],
            include: [
                { model: Temporada, attributes: ['temporada'] },
                { model: Categoria, attributes: ['nombre'] },
                { model: TipoProducto, attributes: ['nombre'] },
                { model: Marca, attributes: ['nombre'] },
                {
                    model: ProductoTallaColor,
                    required: false, // Permitir productos sin tallas/colores específicos
                    where: {
                        ...(talla_id ? { talla_id: Array.isArray(talla_id) ? { [Op.in]: talla_id } : talla_id } : {}),
                        ...(color_id ? { color_id: Array.isArray(color_id) ? { [Op.in]: color_id } : color_id } : {})
                    },
                    include: [
                        { model: Talla, attributes: ['talla'] },
                        { model: ColorProducto, attributes: ['color', 'colorHex'] }
                    ]
                }
            ],
            distinct: true // Evitar duplicados si un producto tiene múltiples tallas/colores
        });

        const productosCatalogo = rows.map(producto => ({
            id: producto.id,
            nombre: `${producto.TipoProducto?.nombre || ''} ${producto.Marca?.nombre || ''} ${producto.Categorium?.nombre || ''}`.trim(),
            precio: producto.precio,
            estado: producto.estado,
            temporada: producto.Temporada?.temporada || null,
            variantes: producto.ProductoTallaColors.map(ptc => ({
                talla: ptc.Talla?.talla,
                color: ptc.ColorProducto?.color
            }))
        }));

        res.json({
            productos: productosCatalogo,
            currentPage: parseInt(page),
            pageSize: parseInt(pageSize),
            totalItems: count
        });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ message: 'Error al obtener el catálogo de productos' });
    }
};

exports.updateProducto = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { temporada_id, categoria_id, tipo_id, marca_id, variantes, precio, estado, calificacion, imagenesAEliminar } = req.body;
        const { userId: userIdFromToken } = req.user;

        // Obtener empleado
        const empleado = await Empleado.findOne({
            where: { usuario_id: userIdFromToken },
            transaction
        });

        if (!empleado) {
            await transaction.rollback();
            return res.status(404).json({ message: "Empleado no encontrado para este usuario." });
        }

        const updatedBy = empleado.id;

        // Verificar producto
        const producto = await Product.findByPk(id, { transaction });
        if (!producto) {
            await transaction.rollback();
            return res.status(404).json({ message: "Producto no encontrado." });
        }

        // Actualizar datos básicos del producto
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

        // Parsear variantes
        let variantesParsed = Array.isArray(variantes) ? variantes : JSON.parse(variantes || '[]');

        // Sincronizar variantes (tallas y colores)
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

            // Eliminar variantes que ya no existen
            for (const [, variante] of existingMap) {
                await variante.destroy({ transaction });
            }
        }

        // Manejar imágenes
        // 1. Eliminar imágenes marcadas para eliminación
        let imagenesAEliminarParsed = [];
        if (imagenesAEliminar) {
            imagenesAEliminarParsed = Array.isArray(imagenesAEliminar) ? imagenesAEliminar : JSON.parse(imagenesAEliminar);
        }
        if (imagenesAEliminarParsed.length > 0) {
            await ImagenProducto.destroy({
                where: {
                    id: imagenesAEliminarParsed,
                    producto_id: id
                },
                transaction
            });
        }

        // 2. Agregar nuevas imágenes desde req.files
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const match = file.fieldname.match(/imagenes\[(\d+)\]/);
                if (match) {
                    const color_id = parseInt(match[1], 10);
                    const imagenUrl = await uploadImageToCloudinary(file);
                    await ImagenProducto.create({
                        producto_id: id,
                        color_id,
                        imagen_url: imagenUrl
                    }, { transaction });
                }
            }
        }

        await transaction.commit();
        res.status(200).json({ message: "Producto actualizado con éxito." });
    } catch (error) {
        await transaction.rollback();
        console.error('Error al actualizar el producto:', error);
        res.status(500).json({ message: "Error al actualizar el producto", error: error.message });
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
                        { 
                            model: ColorProducto, 
                            attributes: ['id', 'color', 'colorHex'],
                            include: [
                                { 
                                    model: ImagenProducto, 
                                    attributes: ['id', 'imagen_url'], 
                                    where: { producto_id: id }, // Aseguramos que las imágenes sean del producto actual
                                    required: false // Hacer la relación opcional
                                }
                            ]
                        }
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
                coloresStock: ptc.ColorProducto ? { 
                    id: ptc.ColorProducto.id, 
                    color: ptc.ColorProducto.color, 
                    colorHex: ptc.ColorProducto.colorHex,
                    imagenes: ptc.ColorProducto.ImagenProductos ? ptc.ColorProducto.ImagenProductos.map(img => ({
                        id: img.id,
                        url: img.imagen_url
                    })) : []
                } : { id: ptc.color_id, color: null, colorHex: null, imagenes: [] } // Fallback si no hay ColorProducto
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
// Ejemplo de controlador para obtener imágenes
exports.getImagenesPorProductoYColor = async (req, res) => {
    try {
        const { producto_id, color_id } = req.query;
        const imagenes = await ImagenProducto.findAll({
            where: {
                producto_id,
                color_id
            }
        });
        res.json(imagenes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};