const Sequelize = require('sequelize')
const sequelize = require('../util/database')

const Product = sequelize.define('product', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull:false,
        primaryKey:true
    },
    categoria: {
        type: Sequelize.STRING
    },
    subcategoria: {
        type: Sequelize.STRING
    },
    produto: {
        type: Sequelize.STRING,
        allowNull:false
    },
    sku: {
        type: Sequelize.INTEGER,
        unique: true
    },
    preco: {
        type: Sequelize.DOUBLE
    },
    link: {
        type: Sequelize.STRING,
        unique: true
    }
});

module.exports = Product;