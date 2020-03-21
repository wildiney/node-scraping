var express = require('express')
var router = express.Router()

var scrapingController = require('../controllers/scrapingController')

router.get('/extra', scrapingController.extra);

module.exports = router;