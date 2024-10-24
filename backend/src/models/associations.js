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

// Definir la asociación entre User y Rol
Rol.hasMany(User, { foreignKey: 'rol_id' });
User.belongsTo(Rol, { foreignKey: 'rol_id' });

// Asociaciones de Categoria
Categoria.hasMany(Product, { foreignKey: 'categoria_id' });
Product.belongsTo(Categoria, { foreignKey: 'categoria_id' });

User.hasOne(Account, { foreignKey: 'user_id' });
Account.belongsTo(User, { foreignKey: 'user_id' });

Account.hasMany(IntentoFallido, { foreignKey: 'account_id' });
IntentoFallido.belongsTo(Account, { foreignKey: 'account_id' });

Account.hasMany(HistorialBloqueos, { foreignKey: 'account_id' });
HistorialBloqueos.belongsTo(Account, { foreignKey: 'account_id', as: 'cuenta' });
// Asociaciones de Account
Account.hasMany(PassHistory, { foreignKey: 'account_id' });
PassHistory.belongsTo(Account, { foreignKey: 'account_id' });

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
    HistorialBloqueos
};
