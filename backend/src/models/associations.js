const Rol = require('./Rol');
const User = require('./User');
const Categoria = require('./Categoria');
const Product = require('./Product');
const Account = require('./Account');
const PassHistory = require('./PasswordHistory');
const PerfilEmpresa = require('./PerfilEmpresa');
const IntentoFallido = require('./IntentoFallido');

// Definir la asociación entre User y Rol
Rol.hasMany(User, { foreignKey: 'rol_id' });
User.belongsTo(Rol, { foreignKey: 'rol_id' });

// Asociaciones de Categoria
Categoria.hasMany(Product, { foreignKey: 'categoria_id' });
Product.belongsTo(Categoria, { foreignKey: 'categoria_id' });

User.hasOne(Account, { foreignKey: 'user_id' });
Account.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(IntentoFallido, { foreignKey: 'user_id' });
IntentoFallido.belongsTo(User, { foreignKey: 'user_id' });

// Asociaciones de Account
Account.hasMany(PassHistory, { foreignKey: 'account_id' });
PassHistory.belongsTo(Account, { foreignKey: 'account_id' });

module.exports = {
    Categoria,
    Product,
    User,
    Account,
    PassHistory,
    PerfilEmpresa,
    IntentoFallido,
    Rol
};
