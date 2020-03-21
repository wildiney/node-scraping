const Sequelize = require('sequelize')

const sequelize = new Sequelize('MarketScraper','root','root',{
    host:'localhost',
    dialect:'mysql'
})

module.exports = sequelize