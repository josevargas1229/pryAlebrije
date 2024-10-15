/* This code snippet is setting up a connection to a MySQL database using Sequelize, which is an ORM
(Object-Relational Mapping) for Node.js. Here's a breakdown of what each part of the code is doing: */
require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,      // Nombre de la base de datos
  process.env.DB_USER,      // Usuario
  process.env.DB_PASSWORD,  // Contraseña
  {
    host: process.env.DB_HOST,   // Host
    dialect: 'mysql',
    dialectOptions: {
      charset: 'utf8mb4'
    }
  }
);

module.exports = sequelize;