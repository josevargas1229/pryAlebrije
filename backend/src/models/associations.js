/* This code snippet is setting up associations between different models in a Node.js application using
Sequelize, which is an ORM for Node.js. Here's a breakdown of what each part is doing: */
const Categoria = require('./Categoria');
const Product = require('./Product');
const User = require('./User');
const Account = require('./Account');
const PassHistory = require('./PasswordHistory');
const PerfilEmpresa = require('./PerfilEmpresa');
const IntentoFallido = require('./IntentoFallido');

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
    IntentoFallido
};