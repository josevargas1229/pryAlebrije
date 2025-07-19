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
const ProductoTallaColor = require('./ProductoTallaColor');
const Promocion = require('./Promocion');
const PromocionProducto = require('./PromocionProducto');
const ImagenProducto = require('./ImagenProducto');
const Carrito = require('./Carrito');
const DetalleCarrito = require('./DetalleCarrito');
const CalificacionProducto = require('./CalificacionProducto');
const LegalDocument = require('./LegalDocument');
const Empleado = require('./Empleado');
const Venta = require('./Ventas');
const DetalleVenta = require('./DetalleVenta');
const HistorialActividades = require('./HistorialActividades');
const VerificationCode =require('./VerificationCode')
const Transaccion = require('./Transaccion');
const Notificacion = require('./Notificacion');
const AuthorizationCode = require('./authorizationCode');
// Definir la asociación entre User y Rol
Rol.hasMany(User, { foreignKey: 'rol_id' });
User.belongsTo(Rol, { foreignKey: 'rol_id' });
// Asociación entre User y Empleado
User.hasOne(Empleado, { foreignKey: 'usuario_id' });
Empleado.belongsTo(User, { foreignKey: 'usuario_id' });
// Asociación entre User y HistorialActividades
User.hasMany(HistorialActividades, { foreignKey: 'usuario_id' });
HistorialActividades.belongsTo(User, { foreignKey: 'usuario_id' });

// Asociación entre Usuario y Notificación
User.hasMany(Notificacion, { foreignKey: 'usuario_id', as: 'notificaciones' });
Notificacion.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });

// Asociación entre Producto y ProductoTallaColor
Product.hasMany(ProductoTallaColor, { foreignKey: 'producto_id' });
ProductoTallaColor.belongsTo(Product, { foreignKey: 'producto_id', as: 'producto' });

// Asociación entre Talla y ProductoTallaColor
Talla.hasMany(ProductoTallaColor, { foreignKey: 'talla_id' });
ProductoTallaColor.belongsTo(Talla, { foreignKey: 'talla_id', as: 'talla' });

// Asociación entre ColorProducto y ProductoTallaColor
ColorProducto.hasMany(ProductoTallaColor, { foreignKey: 'color_id' });
ProductoTallaColor.belongsTo(ColorProducto, { foreignKey: 'color_id', as: 'color' });

// Asociaciones de Promociones
Promocion.belongsToMany(Product, { through: PromocionProducto, foreignKey: 'promocion_id', as: 'productos' });
Product.belongsToMany(Promocion, { through: PromocionProducto, foreignKey: 'producto_id', as: 'promociones' });

// Asociaciones de Categoría
Categoria.hasMany(Product, { foreignKey: 'categoria_id' });
Product.belongsTo(Categoria, { foreignKey: 'categoria_id' });

// Asociaciones de Marca, Tipo y Temporada
Temporada.hasMany(Product, { foreignKey: 'temporada_id' });
Product.belongsTo(Temporada, { foreignKey: 'temporada_id' });

TipoProducto.hasMany(Product, { foreignKey: 'tipo_id' });
Product.belongsTo(TipoProducto, { foreignKey: 'tipo_id' });

Marca.hasMany(Product, { foreignKey: 'marca_id' });
Product.belongsTo(Marca, { foreignKey: 'marca_id' });

// Asociaciones de Imagenes
Product.hasMany(ImagenProducto, { foreignKey: 'producto_id' });
ImagenProducto.belongsTo(Product, { foreignKey: 'producto_id' });

// asociación con ColorProducto
ColorProducto.hasMany(ImagenProducto, { foreignKey: 'color_id' });
ImagenProducto.belongsTo(ColorProducto, { foreignKey: 'color_id' });

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

Account.hasMany(PassHistory, {
    foreignKey: 'account_id',
    onDelete: 'CASCADE', // Si quieres mantener esta regla
    onUpdate: 'CASCADE', // Si quieres mantener esta regla
    constraints: true,   // Asegura que se aplique la restricción
    foreignKeyConstraint: true,
    constraintName: 'fk_historialPass_account_id' // Nombre único para la restricción
});

PassHistory.belongsTo(Account, {
    foreignKey: 'account_id',
    onDelete: 'CASCADE', // Si quieres mantener esta regla
    onUpdate: 'CASCADE', // Si quieres mantener esta regla
    constraints: true,   // Asegura que se aplique la restricción
    foreignKeyConstraint: true,
    constraintName: 'fk_historialPass_account_id' // El mismo nombre único
});
// Asociaciones de Email
EmailType.belongsTo(User, { as: 'creador', foreignKey: 'creado_por' });
EmailTemplate.belongsTo(EmailType, { foreignKey: 'tipo_id', as: 'tipo' });
EmailTemplate.belongsTo(User, { as: 'creador', foreignKey: 'creado_por' });
EmailTemplate.belongsTo(User, { as: 'actualizador', foreignKey: 'actualizado_por' });
EmailType.hasMany(EmailTemplate, { foreignKey: 'tipo_id', as: 'templates' });

// Asociaciones de Ventas

// Asociación entre Usuario y Ventas (Un usuario puede tener muchas ventas)
User.hasMany(Venta, { foreignKey: 'usuario_id' });
Venta.belongsTo(User, { foreignKey: 'usuario_id' });

// Asociación entre Empleado y Ventas (Si los empleados pueden registrar ventas)
Empleado.hasMany(Venta, { foreignKey: 'empleado_id' });
Venta.belongsTo(Empleado, { foreignKey: 'empleado_id' });

// Asociación entre Venta y DetalleVenta (Una venta puede tener muchos detalles)
Venta.hasMany(DetalleVenta, { foreignKey: 'venta_id', as: 'detalles' });
DetalleVenta.belongsTo(Venta, { foreignKey: 'venta_id', as: 'venta' });

// Asociación entre DetalleVenta y ProductoTallaColor
ProductoTallaColor.hasMany(DetalleVenta, { foreignKey: 'producto_talla_color_id', as: 'detalles' });
DetalleVenta.belongsTo(ProductoTallaColor, { foreignKey: 'producto_talla_color_id', as: 'productoTallaColor' });

// Relación entre Producto y TipoProducto (cada producto tiene un tipo)
TipoProducto.hasMany(Product, { foreignKey: 'tipo_id' });
Product.belongsTo(TipoProducto, { foreignKey: 'tipo_id', as: 'tipoProducto' });

// Asociación entre Producto y ImagenProducto (Un producto puede tener muchas imágenes)
Product.hasMany(ImagenProducto, { foreignKey: 'producto_id', as: 'imagenes' });
ImagenProducto.belongsTo(Product, { foreignKey: 'producto_id' });

// dentro de associations.js
Transaccion.belongsTo(Venta, { foreignKey: 'venta_id', as: 'venta' });
Transaccion.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });

AuthorizationCode.belongsTo(User, { foreignKey: 'user_id', as: 'User' });


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
    CalificacionProducto,
    LegalDocument,
    ProductoTallaColor,
    Empleado,
    Venta,
    DetalleVenta,
    HistorialActividades,
    HistorialActividades,
    VerificationCode,
    Transaccion,
    Notificacion,
    AuthorizationCode
};
