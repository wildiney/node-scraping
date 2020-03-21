const Scraper = require('../util/scraper')
const fs = require('fs')

const Product = require('../models/product')

exports.extra = function (req, res, next) {
    const data = JSON.parse(fs.readFileSync('./data/urls.json'))
    const scraper = new Scraper(data, "https://www.clubeextra.com.br")
    scraper.extractContent().then(
        (result)=>{
            res.send(JSON.parse(result))
        }
    )
}
