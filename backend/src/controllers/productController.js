const sequelize = require('../config/database');
const { Product, Empleado, Temporada, Categoria, TipoProducto, Marca, Talla, ColorProducto, ProductoTallaColor, ImagenProducto } = require('../models/associations');
const { Op } = require('sequelize');
const { uploadImageToCloudinary } = require('../config/cloudinaryConfig');
const logAudit = require('../utils/audit');

const fetchModelData = async (model, orderField) => {
    return model.findAll({ order: [[orderField, 'ASC']] });
};
const getEmpleadoId = async (userIdFromToken, transaction) => {
    const empleado = await Empleado.findOne({ where: { usuario_id: userIdFromToken }, transaction });
    if (!empleado) throw new Error('Empleado no encontrado para este usuario.');
    return empleado.id;
};
const parseVariantes = (variantes) => {
    return Array.isArray(variantes) ? variantes : JSON.parse(variantes || '[]');
};
const handleVariantes = async (productoId, variantes, transaction) => {
    for (const variante of variantes) {
        const { talla_id, color_id, stock } = variante;
        const talla = await Talla.findByPk(talla_id, { transaction });
        const color = await ColorProducto.findByPk(color_id, { transaction });

        if (!talla || !color) {
            throw new Error('Talla o color inválido');
        }

        await ProductoTallaColor.create(
            { producto_id: productoId, talla_id: talla.id, color_id: color.id, stock },
            { transaction }
        );
    }
};
const updateVariantes = async (productoId, variantes, transaction) => {
    const existingVariantes = await ProductoTallaColor.findAll({ where: { producto_id: productoId }, transaction });
    const existingMap = new Map(existingVariantes.map(v => [`${v.talla_id}-${v.color_id}`, v]));

    for (const variante of variantes) {
        const { talla_id, color_id, stock } = variante;
        const key = `${talla_id}-${color_id}`;
        if (existingMap.has(key)) {
            await existingMap.get(key).update({ stock }, { transaction });
            existingMap.delete(key);
        } else {
            await ProductoTallaColor.create({ producto_id: productoId, talla_id, color_id, stock }, { transaction });
        }
    }

    for (const [, variante] of existingMap) {
        await variante.destroy({ transaction });
    }
};
const handleImages = async (productoId, files, transaction) => {
    if (!files || files.length === 0) return;

    for (const file of files) {
        const match = file.fieldname.match(/imagenes\[(\d+)\]/);
        if (match) {
            const color_id = parseInt(match[1], 10);
            const imagenUrl = await uploadImageToCloudinary(file);
            await ImagenProducto.create({ producto_id: productoId, color_id, imagen_url: imagenUrl }, { transaction });
        }
    }
};
const deleteImages = async (productoId, imagenesAEliminar, transaction) => {
    if (!imagenesAEliminar || imagenesAEliminar.length === 0) return;
    await ImagenProducto.destroy({ where: { id: imagenesAEliminar, producto_id: productoId }, transaction });
};
const parseEstado = (estado) => {
    if (estado === 'true' || estado === '1') return true;
    if (estado === 'false' || estado === '0') return false;
    return undefined;
};
const addFilter = (whereCondition, key, value) => {
    if (value) {
        whereCondition[key] = Array.isArray(value) ? { [Op.in]: value } : value;
    }
};
const buildWhereCondition = (query) => {
    const { estado, categoria_id, tipo_id, marca_id, talla_id, color_id, temporada_id, search } = query;
    const whereCondition = { is_deleted: false };

    if (estado !== undefined && estado !== '') {
        whereCondition.estado = parseEstado(estado);
    }

    addFilter(whereCondition, 'categoria_id', categoria_id);
    addFilter(whereCondition, 'tipo_id', tipo_id);
    addFilter(whereCondition, 'marca_id', marca_id);
    addFilter(whereCondition, 'temporada_id', temporada_id);

    if (search) {
        whereCondition[Op.or] = [
            { '$TipoProducto.nombre$': { [Op.like]: `%${search}%` } },
            { '$Marca.nombre$': { [Op.like]: `%${search}%` } },
            { '$Categorium.nombre$': { [Op.like]: `%${search}%` } },
        ];
    }

    return whereCondition;
};
const buildProductoTallaColorWhere = ({ talla_id, color_id }) => {
    const where = {};
    if (talla_id) {
        where.talla_id = Array.isArray(talla_id) ? { [Op.in]: talla_id } : talla_id;
    }
    if (color_id) {
        where.color_id = Array.isArray(color_id) ? { [Op.in]: color_id } : color_id;
    }
    return where;
};
const mapProductoCatalogo = (producto) => ({
    id: producto.id,
    nombre: `${producto.TipoProducto?.nombre || ''} ${producto.Marca?.nombre || ''} ${producto.Categorium?.nombre || ''}`.trim(),
    precio: producto.precio,
    estado: producto.estado,
    temporada: producto.Temporada?.temporada || null,
    variantes: producto.ProductoTallaColors.map(ptc => ({
        talla: ptc.Talla?.talla,
        color: ptc.ColorProducto?.color,
    })),
});
const mapProductoTransformado = (producto) => ({
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
    tallasColoresStock: producto.ProductoTallaColors.map(ptc => ({
        id: ptc.id,
        producto_id: ptc.producto_id,
        stock: ptc.stock,
        talla: ptc.Talla ? { id: ptc.Talla.id, talla: ptc.Talla.talla } : null,
        coloresStock: ptc.ColorProducto ? {
            id: ptc.ColorProducto.id,
            color: ptc.ColorProducto.color,
            colorHex: ptc.ColorProducto.colorHex,
            imagenes: ptc.ColorProducto.ImagenProductos.map(img => ({
                id: img.id,
                url: img.imagen_url,
            })),
        } : { id: ptc.color_id, color: null, colorHex: null, imagenes: [] },
    })),
});
const mapDeletedProductos = (producto) => ({
    id: producto.id,
    nombre_producto: `${producto.TipoProducto?.nombre || ''} ${producto.Marca?.nombre || ''} ${producto.Categorium?.nombre || ''}`.trim(),
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
    tallasColoresStock: producto.ProductoTallaColors.map(ptc => ({
        id: ptc.id,
        producto_id: ptc.producto_id,
        stock: ptc.stock,
        talla: ptc.Talla ? { id: ptc.Talla.id, talla: ptc.Talla.talla } : null,
        coloresStock: ptc.ColorProducto ? { id: ptc.ColorProducto.id, color: ptc.ColorProducto.color, colorHex: ptc.ColorProducto.colorHex } : null,
    })),
});
const formatLowStockProducts = (item) => ({
    id: item.id,
    nombre: `${item.Producto.TipoProducto.nombre || ''} ${item.Producto.Marca.nombre || ''} ${item.Producto.Categorium.nombre || ''}`.trim(),
    stock: item.stock,
    categoria: item.Producto.Categorium.nombre || 'Sin categoría',
    talla: item.Talla?.talla || 'Sin talla',
    color: {
        nombre: item.ColorProducto?.color || 'Sin color',
        hex: item.ColorProducto?.colorHex || '#000000',
    },
});
exports.createProducto = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { temporada_id, categoria_id, tipo_id, marca_id, variantes, precio, estado, calificacion } = req.body;
        const { userId: userIdFromToken } = req.user;

        const createdBy = await getEmpleadoId(userIdFromToken, transaction);

        const nuevoProducto = await Product.create(
            {
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
                updated_at: new Date(),
            },
            { transaction }
        );

        const variantesParsed = parseVariantes(variantes);
        if (variantesParsed.length > 0) {
            await handleVariantes(nuevoProducto.id, variantesParsed, transaction);
        }

        await handleImages(nuevoProducto.id, req.files, transaction);

        await logAudit('productos', userIdFromToken, 'crear_producto', {
            producto_id: nuevoProducto.id,
            datos: nuevoProducto,
        });

        await transaction.commit();
        res.status(201).json({ message: 'Producto creado con éxito', producto: nuevoProducto });
    } catch (error) {
        await transaction.rollback();
        console.error('Error al crear el producto:', error);
        res.status(400).json({ message: 'Error al crear el producto', error: error.message });
    }
};
exports.getAllFilters = async (req, res) => {
    try {
        const [temporadas, categorias, tipos, marcas, tallas, colores] = await Promise.all([
            fetchModelData(Temporada, 'temporada'),
            fetchModelData(Categoria, 'nombre'),
            fetchModelData(TipoProducto, 'nombre'),
            fetchModelData(Marca, 'nombre'),
            fetchModelData(Talla, 'talla'),
            fetchModelData(ColorProducto, 'color'),
        ]);

        res.status(200).json({ temporadas, categorias, tipos, marcas, tallas, colores });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los datos', error: error.message });
    }
};
exports.getAllProductos = async (req, res) => {
    try {
        const { page = 1, pageSize = 10 } = req.query;
        const offset = (page - 1) * pageSize;

        const whereCondition = buildWhereCondition(req.query);
        const productoTallaColorWhere = buildProductoTallaColorWhere(req.query);

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
                    required: false,
                    where: productoTallaColorWhere,
                    include: [
                        { model: Talla, attributes: ['talla'] },
                        { model: ColorProducto, attributes: ['color', 'colorHex'] },
                    ],
                },
            ],
            distinct: true,
        });

        const productosCatalogo = rows.map(mapProductoCatalogo);

        res.json({
            productos: productosCatalogo,
            currentPage: parseInt(page),
            pageSize: parseInt(pageSize),
            totalItems: count,
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

        const updatedBy = await getEmpleadoId(userIdFromToken, transaction);

        const producto = await Product.findByPk(id, { transaction });
        if (!producto) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }

        await producto.update(
            {
                temporada_id,
                categoria_id,
                tipo_id,
                marca_id,
                precio,
                estado,
                calificacion,
                updated_by: updatedBy,
                updated_at: new Date(),
            },
            { transaction }
        );

        const variantesParsed = parseVariantes(variantes);
        if (variantesParsed.length > 0) {
            await updateVariantes(id, variantesParsed, transaction);
        }

        const imagenesAEliminarParsed = parseVariantes(imagenesAEliminar); // Reutilizamos parseVariantes
        await deleteImages(id, imagenesAEliminarParsed, transaction);
        await handleImages(id, req.files, transaction);

        await logAudit('productos', userIdFromToken, 'actualizar_producto', {
            producto_id: id,
            datos: { temporada_id, categoria_id, tipo_id, marca_id, precio, estado, calificacion },
            variantes: variantesParsed,
            imagenes_eliminadas: imagenesAEliminarParsed,
            nuevas_imagenes: req.files ? req.files.map(f => f.fieldname) : [],
        });

        await transaction.commit();
        res.status(200).json({ message: 'Producto actualizado con éxito.' });
    } catch (error) {
        await transaction.rollback();
        console.error('Error al actualizar el producto:', error);
        res.status(500).json({ message: 'Error al actualizar el producto', error: error.message });
    }
};
exports.getProductoById = async (req, res) => {
    try {
        const { id } = req.params;

        const producto = await Product.findByPk(id, {
            attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'deleted_at', 'is_deleted'] },
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
                            include: [{ model: ImagenProducto, attributes: ['id', 'imagen_url'], where: { producto_id: id }, required: false }],
                        },
                    ],
                },
            ],
        });

        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }

        const productoTransformado = mapProductoTransformado(producto);
        res.status(200).json({ producto: productoTransformado });
    } catch (error) {
        console.error('Error al obtener el producto:', error);
        res.status(500).json({ message: 'Error al obtener el producto', error: error.message });
    }
};
exports.deleteProducto = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { userId: userIdFromToken } = req.user;

        const deletedBy = await getEmpleadoId(userIdFromToken, transaction);

        const producto = await Product.findByPk(id, { transaction });
        if (!producto) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }
        if (producto.is_deleted) {
            await transaction.rollback();
            return res.status(400).json({ message: 'El producto ya está marcado como eliminado.' });
        }

        await producto.update(
            { is_deleted: true, deleted_at: new Date(), deleted_by: deletedBy },
            { transaction }
        );

        await logAudit('productos', userIdFromToken, 'eliminar_producto', { producto_id: id });

        await transaction.commit();
        res.status(200).json({ message: 'Producto eliminado lógicamente con éxito.' });
    } catch (error) {
        await transaction.rollback();
        console.error('Error al eliminar el producto:', error);
        res.status(500).json({ message: 'Error al eliminar el producto', error: error.message });
    }
};
exports.getDeletedProductos = async (req, res) => {
    try {
        const { page = 1, pageSize = 10 } = req.query;
        const offset = (page - 1) * pageSize;

        const { count, rows } = await Product.findAndCountAll({
            where: { is_deleted: true },
            limit: parseInt(pageSize, 10),
            offset,
            attributes: { exclude: ['created_by', 'updated_by'] },
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
                        { model: ColorProducto, attributes: ['id', 'color', 'colorHex'] },
                    ],
                },
            ],
            order: [['deleted_at', 'DESC']], // Ordenar por fecha de eliminación
            distinct: true,
        });

        const productosTransformados = rows.map(mapDeletedProductos);
        res.status(200).json({
            productos: productosTransformados,
            currentPage: parseInt(page, 10),
            pageSize: parseInt(pageSize, 10),
            total: count,
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

        const updatedBy = await getEmpleadoId(userIdFromToken, transaction);

        const producto = await Product.findByPk(id, { transaction });
        if (!producto) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }
        if (!producto.is_deleted) {
            await transaction.rollback();
            return res.status(400).json({ message: 'El producto no está marcado como eliminado.' });
        }

        await producto.update(
            { is_deleted: false, deleted_at: null, deleted_by: null, updated_by: updatedBy, updated_at: new Date() },
            { transaction }
        );

        await logAudit('productos', userIdFromToken, 'restaurar_producto', { producto_id: id });

        await transaction.commit();
        res.status(200).json({ message: 'Producto restaurado con éxito.' });
    } catch (error) {
        await transaction.rollback();
        console.error('Error al restaurar el producto:', error);
        res.status(500).json({ message: 'Error al restaurar el producto', error: error.message });
    }
};
exports.getImagenesPorProductoYColor = async (req, res) => {
    try {
        const { producto_id, color_id } = req.query;
        const imagenes = await ImagenProducto.findAll({
            where: { producto_id, color_id },
        });
        res.json(imagenes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const NIVEL_MINIMO_DEFAULT = 10;
exports.getLowStockProducts = async (req, res) => {
    try {
        const lowStockItems = await ProductoTallaColor.findAll({
            where: { stock: { [Op.lte]: NIVEL_MINIMO_DEFAULT } },
            attributes: ['id', 'stock', 'talla_id', 'color_id'],
            include: [
                {
                    model: Product,
                    attributes: ['id'],
                    where: { is_deleted: false },
                    include: [
                        { model: TipoProducto, attributes: ['nombre'] },
                        { model: Marca, attributes: ['nombre'] },
                        { model: Categoria, attributes: ['nombre'], as: 'Categorium' },
                    ],
                },
                { model: Talla, attributes: ['talla'] },
                { model: ColorProducto, attributes: ['color', 'colorHex'] },
            ],
            order: [['stock', 'ASC'], [Product, 'Categorium', 'nombre', 'ASC']],
            raw: true,
            nest: true,
        });

        const formattedProducts = lowStockItems.map(formatLowStockProducts);
        // Registrar en el log de auditoría
        // await logAudit(userIdFromToken, 'productos', 'consultar_bajo_stock', {
        //     total_productos: formattedProducts.length
        // });
        res.status(200).json({
            productos: formattedProducts,
            nivel_minimo_default: NIVEL_MINIMO_DEFAULT,
        });
    } catch (error) {
        console.error('Error al obtener productos con bajo stock:', error);
        res.status(500).json({ message: 'Error al obtener productos con bajo stock', error: error.message });
    }
};