const puppeteer = require('puppeteer')
const cheerio = require('cheerio')
const { Parser } = require('json2csv')

const SaveFile = require('../util/saveFile')
const Product = require('../models/product')


module.exports = class Scraping {
  constructor(resource, site) {
    this.resource = resource
    this.products = []
    this.site = site
    this.urls = []
  }

  async extractContent() {
    console.log("Initiating Extract Content")
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    page.setViewport({ width: 1280, height: 960 })

    const urls = this.resource
    for (let i = 0; i < urls.length; i++) {
      const newurl = urls[i].url
      console.log(newurl)

      const category = urls[i].text
      console.log(category)

      await page.goto(newurl)

      let html = await page.content()
      const $ = await cheerio.load(html)

      await page.waitFor(15000)

      const qtdProdutosSelector = '#product-list > div > div:nth-child(3) > div.col-xs-12.col-sm-10.col-md-9.col-lg-10 > div > div > div.row > div.col-sm-4.col-md-4.col-lg-4 > p'
      await page.waitForSelector(qtdProdutosSelector)

      const qtdProdutos = $(qtdProdutosSelector).text().split(' ')[3]
      console.log(qtdProdutos)

      for (let k = 0; k < qtdProdutos / 12; k++) {
        await page.evaluate(() => window.scrollTo(0, Number.MAX_SAFE_INTEGER));
        await page.waitFor(1500)
      }

      await page.waitForSelector(`#product-list > div > div:nth-child(3) > div.col-xs-12.col-sm-10.col-md-9.col-lg-10 > div > div > div.row > infinite-scroll > div:nth-child(1) > product-card > div > div > div`)

      const products = await page.$$eval('.panel-product', (item) => {
        let items = [];
        item.forEach((element) => {
          let category = element.getAttribute('categoria')
          let subCategory = element.getAttribute('subcategoria')
          let productName = element.getAttribute('produto-nome')
          let productSku = element.getAttribute('produto-sku')
          let productPrice = element.getAttribute('produto-preco')
          let productLink = element.querySelector('.thumbnail a').getAttribute('href')
          let product = { categoria: category, subcategoria: subCategory, produto: productName, sku: productSku, preco: productPrice, link: productLink };
          if (productName !== '') {
            items.push(product)
          }
        })
        return items;
      }).then((result) => {
        const productList = JSON.stringify(result)
        const plParsed = JSON.parse(productList)

        this.products.push(productList)
        SaveFile.toJson('./data/products.json', productList)

        plParsed.forEach((obj) => {
          Product.create({
            categoria: obj.categoria,
            subcategoria: obj.subcategoria,
            produto: obj.produto,
            sku: obj.sku,
            preco: obj.preco,
            link: this.site + obj.link
          }).then(
            //r => console.log(r)
          ).catch(e => e.message)
        })

      }).catch(e => console.log(e.message))

    }

    await browser.close()
    console.log("Finishing")

    return this.products

  }
}
