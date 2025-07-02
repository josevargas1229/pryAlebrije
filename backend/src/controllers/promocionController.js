const { Op } = require('sequelize');
const Promocion = require('../models/Promocion');
const Product = require('../models/Product');
const ImagenProducto = require('../models/ImagenProducto');
const PromocionProducto = require('../models/PromocionProducto');
const TipoProducto = require('../models/TipoProducto');
// Obtener promociones activas para la página principal

exports.getPromocionesActivas = async (req, res) => {
  try {
    const hoy = new Date();

    const promocionesRaw = await Promocion.findAll({
      where: {
        fecha_inicio: { [Op.lte]: hoy },
        fecha_fin: { [Op.gte]: hoy }
      },
      include: [
        {
          model: Product,
          as: 'productos',
          include: [
            { model: ImagenProducto, as: 'imagenes' },
            { model: TipoProducto, as: 'tipoProducto' }
          ]
        }
      ]
    });

    // 🔧 Conversión segura: asegurar que `productos` es un array
    const promociones = promocionesRaw.map(promo => {
      const plain = promo.get({ plain: true });
      return {
        ...plain,
        productos: Array.isArray(plain.productos)
          ? plain.productos
          : Object.values(plain.productos || {})
      };
    });

    res.json(promociones);
  } catch (error) {
    console.error('Error al obtener promociones:', error);
    res.status(500).json({ error: 'Error al obtener promociones activas' });
  }
};



// Crear nueva promoción con productos asociados
exports.crearPromocion = async (req, res) => {
  try {
    const { nombre, fecha_inicio, fecha_fin, tipo, descuento, productos } = req.body;

    const nuevaPromocion = await Promocion.create({ nombre, fecha_inicio, fecha_fin, tipo, descuento });

    if (productos && productos.length > 0) {
      const relaciones = productos.map(pid => ({
        promocion_id: nuevaPromocion.id,
        producto_id: pid
      }));
      await PromocionProducto.bulkCreate(relaciones);
    }

    res.status(201).json(nuevaPromocion);
  } catch (err) {
    console.error('Error creando promoción:', err);
    res.status(500).json({ error: 'Error al crear promoción' });
  }
};

// Obtener todas las promociones (admin)
exports.getTodas = async (req, res) => {
  try {
    const promociones = await Promocion.findAll({
      include: [
        {
          model: Product,
          as: 'productos',
          include: [{ model: ImagenProducto, as: 'imagenes' },
             { model: TipoProducto, as: 'tipoProducto' }
          ]

        }
      ]
    });
    res.json(promociones);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar promociones' });
  }
};

// Actualizar promoción
exports.actualizarPromocion = async (req, res) => {
  const { id } = req.params;
  const { nombre, fecha_inicio, fecha_fin, tipo, descuento, productos } = req.body;

  try {
    await Promocion.update({ nombre, fecha_inicio, fecha_fin, tipo, descuento }, { where: { id } });

    // Reasociar productos
    await PromocionProducto.destroy({ where: { promocion_id: id } });
    if (productos && productos.length > 0) {
      const relaciones = productos.map(pid => ({
        promocion_id: id,
        producto_id: pid
      }));
      await PromocionProducto.bulkCreate(relaciones);
    }

    res.json({ mensaje: 'Promoción actualizada' });
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando promoción' });
  }
};

// Eliminar promoción
exports.eliminarPromocion = async (req, res) => {
  const { id } = req.params;
  try {
    await PromocionProducto.destroy({ where: { promocion_id: id } });
    await Promocion.destroy({ where: { id } });
    res.json({ mensaje: 'Promoción eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar promoción' });
  }
};
