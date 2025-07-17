const sequelize = require('../config/database');
const { Venta, DetalleVenta, User, Product, Talla, ColorProducto, TipoProducto, ProductoTallaColor, ImagenProducto } = require('../models/associations');
const { Op } = require('sequelize');
const axios = require('axios');
const Transaccion = require('../models/Transaccion');
const { crearNotificacion } = require('./notificacionController'); // asegúrate que la ruta sea correcta
require('dotenv').config();
const mercadopago = require('mercadopago');

const mp = new mercadopago.MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  locale: 'es-MX',
});

const preferenceClient = new mercadopago.Preference(mp);




/**
 * Crear una nueva venta con detalles
 */
exports.createVenta = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
      const { usuario_id, total, productos, recogerEnTienda, direccion_id } = req.body;

      if (!productos || productos.length === 0) {
          return res.status(400).json({ message: "No se pueden procesar ventas sin productos." });
      }

      const nuevaVenta = await Venta.create({
          usuario_id,
          total,
          recoger_en_tienda: recogerEnTienda,
          estado: 'Pendiente',
          direccion_id: direccion_id || null,
          created_at: new Date()
      }, { transaction });

      for (const item of productos) {
  const { producto_id, talla_id, color_id, cantidad } = item;

  if (talla_id === null || talla_id === undefined || color_id === null || color_id === undefined) {
    await transaction.rollback();
    return res.status(400).json({ message: "Los productos deben tener talla y color." });
  }

  const productoTallaColor = await ProductoTallaColor.findOne({
    where: { producto_id, talla_id, color_id }
  });

  if (!productoTallaColor) {
    await transaction.rollback();
    return res.status(404).json({ message: 'Combinación de producto, talla y color no encontrada.' });
  }

  if (productoTallaColor.stock < cantidad) {
    await transaction.rollback();
    return res.status(400).json({ message: 'No hay suficiente stock disponible.' });
  }

  const producto = await Product.findByPk(producto_id, {
    include: [
      {
        association: 'promociones',
        where: {
          fecha_inicio: { [Op.lte]: new Date() },
          fecha_fin: { [Op.gte]: new Date() }
        },
        required: false
      }
    ]
  });

  let precio_unitario = parseFloat(producto.precio);
  if (producto.promociones && producto.promociones.length > 0) {
    const promo = producto.promociones[0];
    const descuento = parseFloat(promo.descuento);
    precio_unitario = +(precio_unitario * (1 - descuento / 100)).toFixed(2);
  }

  productoTallaColor.stock -= cantidad;
  await productoTallaColor.save({ transaction });

  await DetalleVenta.create({
    venta_id: nuevaVenta.id,
    producto_id,
    talla_id,
    color_id,
    cantidad,
    precio_unitario,
    subtotal: +(precio_unitario * cantidad).toFixed(2)
  }, { transaction });
}

      await transaction.commit();
      await crearNotificacion({
      mensaje: `Compra realizada correctamente. Total: $${nuevaVenta.total}`,
      tipo: 'usuario',
      usuario_id
      });
      return res.status(201).json({ message: "Venta creada con éxito.", venta: nuevaVenta });

  } catch (error) {
      await transaction.rollback();
      console.error('Error en `createVenta`:', error);
      return res.status(500).json({ message: "Error al procesar la venta.", error: error.message });
  }
};

/**
 * Obtener todas las ventas de un usuario específico
 */
exports.getVentasByUsuario = async (req, res) => {
  try {
      const { usuario_id } = req.params;

      const ventas = await Venta.findAll({
        where: { usuario_id: usuario_id },
        include: [
            {
                model: DetalleVenta,
                as: 'detalles',
                include: [
                    {
                        model: Product,
                        as: 'producto',
                        attributes: ['id', 'precio'],
                        include: [
                            {
                                model: TipoProducto,
                                as: 'tipoProducto',
                                attributes: ['nombre']
                            },
                            {
                                model: ImagenProducto,
                                as: 'imagenes', // Alias correcto para ImagenProducto
                                attributes: ['imagen_url']
                            }
                        ]
                    },
                    {
                        model: Talla,
                        as: 'talla',  // Cambié de 'Talla' a 'talla' para que coincida con tus asociaciones.
                        attributes: ['talla']
                    },
                    {
                        model: ColorProducto,
                        as: 'color', // Cambié de 'ColorProducto' a 'color' para que coincida con tus asociaciones.
                        attributes: ['color', 'colorHex']
                    }
                ]
            }
        ],
        order: [['fecha_venta', 'DESC']],
    });


      return res.status(200).json({ ventas });

  } catch (error) {
      console.error('Error al obtener ventas del usuario:', error);
      return res.status(500).json({ message: "Error al obtener las ventas.", error: error.message });
  }
};



/**
 * Obtener detalles de una venta específica
 */

exports.getVentaById = async (req, res) => {
  try {
      const { venta_id } = req.params;

      const venta = await Venta.findByPk(venta_id, {
          include: [
              { model: User, attributes: ['nombre', 'email'] },
              {
                  model: DetalleVenta,
                  as: 'detalles', // Asegúrate de usar el alias 'detalles' aquí
                  include: [
                      {
                          model: Product,
                          as: 'producto',
                          attributes: ['id', 'precio'],
                          include: [
                              {
                                  model: TipoProducto,
                                  as: 'tipoProducto',
                                  attributes: ['nombre']
                              },
                              {
                                  model: ImagenProducto,
                                  as: 'imagenes',
                                  attributes: ['imagen_url']
                              }
                          ]
                      },
                      {
                          model: Talla,
                          as: 'talla',
                          attributes: ['talla']
                      },
                      {
                          model: ColorProducto,
                          as: 'color',
                          attributes: ['color', 'colorHex']
                      }
                  ]
              }
          ]
      });

      if (!venta) {
          return res.status(404).json({ message: "Venta no encontrada." });
      }

      return res.status(200).json({ venta });

  } catch (error) {
      console.error('Error al obtener la venta:', error);
      return res.status(500).json({ message: "Error al obtener la venta.", error: error.message });
  }
};

// Obtiene un token de acceso válido desde PayPal
async function getAccessToken() {
  const response = await axios({
    url: 'https://api-m.sandbox.paypal.com/v1/oauth2/token',
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'en_US',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    auth: {
      username: process.env.PAYPAL_CLIENT_ID,
      password: process.env.PAYPAL_CLIENT_SECRET,
    },
    params: {
      grant_type: 'client_credentials',
    },
  });

  return response.data.access_token;
}

exports.createOrder = async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    const { total } = req.body;

    const response = await axios({
      url: 'https://api-m.sandbox.paypal.com/v2/checkout/orders',
      method: 'post',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'MXN',
              value: total,
            },
          },
        ],
      },
    });

    res.json({ id: response.data.id });
  } catch (error) {
    console.error('Error al crear la orden:', error);
    res.status(500).json({ error: 'Error al crear la orden' });
  }
};
exports.captureOrder = async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    const { orderID } = req.params;
    const { venta_id, usuario_id } = req.body;

    const response = await axios({
      url: `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderID}/capture`,
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      data: {}
    });

    await Transaccion.create({
      venta_id,
      usuario_id,
      metodo_pago: 'paypal',
      estado: 'exitoso',
      respuesta_raw: response.data,
      created_at: new Date()
    });

    res.json(response.data);
  } catch (error) {
    console.error('❌ Error al capturar la orden:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error al capturar la orden' });
  }
};


exports.createPreference = async (req, res) => {
  try {
    const { productos, total } = req.body;

    console.log('📦 Productos recibidos para preferencia MP:', productos);


    if (!productos || productos.length === 0) {
      return res.status(400).json({ message: "No se pueden procesar preferencias sin productos." });
    }

    const items = productos.map((p, i) => {
  if (!p || p.precio_unitario == null || p.cantidad == null) {
    console.warn(`❌ Producto [${i}] inválido:`, p);
    throw new Error(`Producto [${i}] inválido: falta precio o cantidad`);
  }

  return {
    title: p.nombre || `Producto ${i + 1}`,
    unit_price: +p.precio_unitario,
    quantity: +p.cantidad,
    currency_id: 'MXN'
  };
});



    const preference = {
  items,
  back_urls: {
    success: 'http://localhost:4200/success',
    failure: 'http://localhost:4200/failure',
    pending: 'http://localhost:4200/pending'
  },
  //auto_return: 'approved'
};


   const response = await preferenceClient.create({ body: preference });

const sandboxInitPoint = response.sandbox_init_point || response.init_point;

return res.status(200).json({
  id: response.id,
  sandbox_init_point: sandboxInitPoint
});
  } catch (error) {
    console.error('❌ Error al crear preferencia:', error);
    return res.status(500).json({ error: 'Error al crear preferencia con Mercado Pago.' });
  }
};
exports.getEstadisticasVentas = async (req, res) => {
  try {
    const { rango = 'mes' } = req.query;

    // Productos más vendidos (top 5)
    const productosMasVendidos = await DetalleVenta.findAll({
      attributes: [
        'producto_id',
        [sequelize.fn('SUM', sequelize.col('cantidad')), 'totalVendidas']
      ],
      group: ['producto_id'],
      order: [[sequelize.literal('totalVendidas'), 'DESC']],
      limit: 5,
      include: [{
        model: Product,
        as: 'producto',
        attributes: ['id'],
        include: [{
          model: TipoProducto,
          as: 'tipoProducto',
          attributes: ['nombre']
        }]
      }]
    });

    let agrupamiento;
    let campo;

    switch (rango) {
      case 'semana':
        agrupamiento = sequelize.literal('FLOOR((DAY(fecha_venta)-1)/7)+1');
        campo = [agrupamiento, 'semana'];
        break;
      case 'mes':
        agrupamiento = sequelize.fn('DATE_FORMAT', sequelize.col('fecha_venta'), '%Y-%m-%d');
        campo = [agrupamiento, 'dia'];
        break;
      case 'año':
        agrupamiento = sequelize.fn('MONTH', sequelize.col('fecha_venta'));
        campo = [agrupamiento, 'mes'];
        break;
      default:
        agrupamiento = sequelize.fn('DATE', sequelize.col('fecha_venta'));
        campo = [agrupamiento, 'dia'];
        break;
    }

    const ventasAgrupadas = await Venta.findAll({
      attributes: [
        campo,
        [sequelize.fn('COUNT', '*'), 'total']
      ],
      group: [agrupamiento],
      order: [[agrupamiento, 'ASC']]
    });

    return res.status(200).json({
      productosMasVendidos,
      ventasAgrupadas
    });
  } catch (error) {
    console.error('Error en getEstadisticasVentas:', error);
    return res.status(500).json({ error: 'No se pudieron obtener las estadísticas de ventas.' });
  }
};

exports.registrarTransaccionMercadoPago = async (req, res) => {
  try {
    const { venta_id, usuario_id, paymentData } = req.body;

    if (!venta_id || !usuario_id || !paymentData) {
      return res.status(400).json({ message: 'Faltan datos para registrar transacción.' });
    }

    await Transaccion.create({
      venta_id,
      usuario_id,
      metodo_pago: 'mercado_pago',
      estado: 'exitoso',
      respuesta_raw: paymentData,
      created_at: new Date()
    });

    return res.status(200).json({ message: 'Transacción registrada exitosamente.' });

  } catch (error) {
    console.error('❌ Error al registrar transacción MP:', error);
    return res.status(500).json({ message: 'Error al registrar la transacción.' });
  }
};




