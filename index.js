const puppeteer = require('puppeteer')
const cheerio = require('cheerio')
const fs = require('fs')


class Scraping {
  constructor(url) {
    this.url = url,
      this.urls = []
    this.products = []
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
      headless: false
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
      await page.waitFor(2000)

      const qtdProdutos = $('#product-list > div > div:nth-child(3) > div.col-xs-12.col-sm-10.col-md-9.col-lg-10 > div > div > div.row > div.col-sm-4.col-md-4.col-lg-4 > p').text().split(' ')[3]
      console.log(qtdProdutos)

      for (let k = 0; k < qtdProdutos / 12; k++) {
        await page.evaluate(() => window.scrollTo(0, Number.MAX_SAFE_INTEGER));
        await page.waitFor(1000)
      }

      await page.waitFor(10000)

      for (let j = 1; j < qtdProdutos; j++) {
        try {
          await page.waitForSelector(`#product-list > div > div:nth-child(3) > div.col-xs-12.col-sm-10.col-md-9.col-lg-10 > div > div > div.row > infinite-scroll > div:nth-child(${j}) > product-card > div > div > div > div.thumbnail > div > div.container-card__body > a > p`)
          let link = $(`#product-list > div > div:nth-child(3) > div.col-xs-12.col-sm-10.col-md-9.col-lg-10 > div > div > div.row > infinite-scroll > div:nth-child(${j}) > product-card > div > div > div > div.thumbnail > div > div.container-card__body > a`).attr('href')
          let name = $(`#product-list > div > div:nth-child(3) > div.col-xs-12.col-sm-10.col-md-9.col-lg-10 > div > div > div.row > infinite-scroll > div:nth-child(${j}) > product-card > div > div > div > div.thumbnail > div > div.container-card__body > a > p`).text().replace('\n', '').trim()
          let sku =  $(`#product-list > div > div:nth-child(3) > div.col-xs-12.col-sm-10.col-md-9.col-lg-10 > div > div > div.row > infinite-scroll > div:nth-child(${j}) > product-card > div > div > div`).attr('produto-sku')
          let price = $(`#product-list > div > div:nth-child(3) > div.col-xs-12.col-sm-10.col-md-9.col-lg-10 > div > div > div.row > infinite-scroll > div:nth-child(${j}) > product-card > div > div > div > div.thumbnail > div > div.container-card__body > a > div.panel-prices.placeholder-item.ng-scope > div > span > div > p`).text().replace('\n', '').trim()

          let object = `"${category}","${sku}", "${name}", "${price}", "${link}"\n`
          if (name !== '') {
            console.log(j, object)
            fs.appendFileSync('products.csv', object)
          } else {
            console.log(j, "Erro", object)
          }
        }
        catch (e) {
          console.log(e.message)
        }
      }
    }

    await browser.close()
    console.log("Finishing")
  }
}


// links = new Scraping()
// links.extractLinks('https://www.clubeextra.com.br')

content = new Scraping()
content.extractContent()

