const puppeteer = require('puppeteer')
const cheerio = require('cheerio')
const json2csv = require('json2csv')
const fs = require('fs')


class Scraping {
  constructor(url) {
    this.url = url,
      this.urls = []
  }

  async extractLinks(site) {
    const browser = await puppeteer.launch({
      headless: false
    })
    const page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');

    await page.goto(site)
    await page.waitFor(5000)

    let html = await page.content()
    const $ = await cheerio.load(html)

    $('a').each((i, element) => {
      try {
        if ($(element).attr('href').includes('/secoes/')) {
          this.urls.push({
            text: $(element).text().replace('\n', '').trim(),
            url: site + $(element).attr('href')
          })
        }
      }
      catch (e) {
        console.log(e, e.message)
      }
    })
    fs.writeFileSync('urls.json', JSON.stringify(this.urls))
    console.dir(this.urls, { 'maxArrayLength': null })

    await browser.close()
    console.log("Finishing")
  }

  async extractContent() {
    const urls = JSON.parse(fs.readFileSync('./urls.json'))
    const browser = await puppeteer.launch({
      headless: true
    })
    const page = await browser.newPage()
    page.setViewport({ width: 1280, height: 960 })
    //await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');

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

      // try {
      for (let k = 0; k < qtdProdutos / 12; k++) {
        await page.evaluate(() => window.scrollTo(0, Number.MAX_SAFE_INTEGER));
        await page.waitFor(1500)
      }

      await page.waitForSelector(`#product-list > div > div:nth-child(3) > div.col-xs-12.col-sm-10.col-md-9.col-lg-10 > div > div > div.row > infinite-scroll > div:nth-child(1) > product-card > div > div > div`)

      const products = await page.$$eval('.panel-product',(item)=>{
        let items=[]
        item.forEach((element) => {
          let category = element.getAttribute('categoria')
          let subCategory = element.getAttribute('subcategoria')
          let productName = element.getAttribute('produto-nome')
          let productSku = element.getAttribute('produto-sku')
          let productPrice = element.getAttribute('produto-preco')
          let productLink = element.querySelector('.thumbnail a').getAttribute('href')

          //let product = `{"categoria":"${category}","subcategoria":"${subCategory}","produto":"${productName}","sku":"${productSku}","preco":"${productPrice}","link":"${productLink}"}`
          let product = `"${category}","${subCategory}","${productName}","${productSku}","${productPrice}","${productLink}"\n`
          if (productName !== '') {
            items.push(product)
          }
        })
        return items;
      })
      //fs.appendFileSync('products.json', JSON.stringify(products))
      fs.appendFileSync('products.csv', products)
    }


    await browser.close()
    console.log("Finishing")
  }

}


// links = new Scraping()
// links.extractLinks('https://www.clubeextra.com.br')

content = new Scraping()
content.extractContent()

