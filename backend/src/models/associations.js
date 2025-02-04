const Rol = require('./Rol');
const User = require('./User');
const Categoria = require('./Categoria');
const Product = require('./Product');
const Account = require('./Account');
const PassHistory = require('./PasswordHistory');
const PerfilEmpresa = require('./PerfilEmpresa');
const IntentoFallido = require('./IntentoFallido');
const EmailType = require('./EmailType');
const EmailTemplate = require('./EmailTemplate');
const ConfiguracionSistema = require('./Configuration');
const HistorialBloqueos = require('./Bloqueos');
const Temporada = require('./Temporada');
const TipoProducto = require('./TipoProducto');
const Marca = require('./Marca');
const Talla = require('./Talla');
const ColorProducto = require('./ColorProducto');
const Promocion = require('./Promocion');
const PromocionProducto = require('./PromocionProducto');
const ImagenProducto = require('./ImagenProducto');
const Carrito = require('./Carrito');
const DetalleCarrito = require('./DetalleCarrito');
const CalificacionProducto = require('./CalificacionProducto');

// Definir la asociación entre User y Rol
Rol.hasMany(User, { foreignKey: 'rol_id' });
User.belongsTo(Rol, { foreignKey: 'rol_id' });

// Asociaciones de Categoria
Categoria.hasMany(Product, { foreignKey: 'categoria_id' });
Product.belongsTo(Categoria, { foreignKey: 'categoria_id' });

// Asociaciones de Producto
Temporada.hasMany(Product, { foreignKey: 'temporada_id' });
Product.belongsTo(Temporada, { foreignKey: 'temporada_id' });

TipoProducto.hasMany(Product, { foreignKey: 'tipo_id' });
Product.belongsTo(TipoProducto, { foreignKey: 'tipo_id' });

Marca.hasMany(Product, { foreignKey: 'marca_id' });
Product.belongsTo(Marca, { foreignKey: 'marca_id' });

Talla.hasMany(Product, { foreignKey: 'talla_id' });
Product.belongsTo(Talla, { foreignKey: 'talla_id' });

ColorProducto.hasMany(Product, { foreignKey: 'color_id' });
Product.belongsTo(ColorProducto, { foreignKey: 'color_id' });

// Asociaciones de Promociones
Promocion.belongsToMany(Product, { through: PromocionProducto, foreignKey: 'promocion_id' });
Product.belongsToMany(Promocion, { through: PromocionProducto, foreignKey: 'producto_id' });

// Asociaciones de Imagenes
Product.hasMany(ImagenProducto, { foreignKey: 'producto_id' });
ImagenProducto.belongsTo(Product, { foreignKey: 'producto_id' });

// Asociaciones de Carrito
User.hasOne(Carrito, { foreignKey: 'usuario_id' });
Carrito.belongsTo(User, { foreignKey: 'usuario_id' });

Carrito.hasMany(DetalleCarrito, { foreignKey: 'carrito_id' });
DetalleCarrito.belongsTo(Carrito, { foreignKey: 'carrito_id' });

Product.hasMany(DetalleCarrito, { foreignKey: 'producto_id' });
DetalleCarrito.belongsTo(Product, { foreignKey: 'producto_id' });

// Asociaciones de Calificaciones
User.hasMany(CalificacionProducto, { foreignKey: 'usuario_id' });
CalificacionProducto.belongsTo(User, { foreignKey: 'usuario_id' });

Product.hasMany(CalificacionProducto, { foreignKey: 'producto_id' });
CalificacionProducto.belongsTo(Product, { foreignKey: 'producto_id' });

// Asociaciones de Account
User.hasOne(Account, { foreignKey: 'user_id' });
Account.belongsTo(User, { foreignKey: 'user_id' });

Account.hasMany(IntentoFallido, { foreignKey: 'account_id' });
IntentoFallido.belongsTo(Account, { foreignKey: 'account_id' });

Account.hasMany(HistorialBloqueos, { foreignKey: 'account_id' });
HistorialBloqueos.belongsTo(Account, { foreignKey: 'account_id', as: 'cuenta' });

Account.hasMany(PassHistory, { foreignKey: 'account_id' });
PassHistory.belongsTo(Account, { foreignKey: 'account_id' });

// Asociaciones de Email
EmailType.belongsTo(User, { as: 'creador', foreignKey: 'creado_por' });
EmailTemplate.belongsTo(EmailType, { foreignKey: 'tipo_id', as: 'tipo' });
EmailTemplate.belongsTo(User, { as: 'creador', foreignKey: 'creado_por' });
EmailTemplate.belongsTo(User, { as: 'actualizador', foreignKey: 'actualizado_por' });
EmailType.hasMany(EmailTemplate, { foreignKey: 'tipo_id', as: 'templates' });

module.exports = {
    Categoria,
    Product,
    User,
    Account,
    PassHistory,
    PerfilEmpresa,
    IntentoFallido,
    Rol,
    EmailType,
    EmailTemplate,
    ConfiguracionSistema,
    HistorialBloqueos,
    Temporada,
    TipoProducto,
    Marca,
    Talla,
    ColorProducto,
    Promocion,
    PromocionProducto,
    ImagenProducto,
    Carrito,
    DetalleCarrito,
    CalificacionProducto
};
