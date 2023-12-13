// routes/currencies.js
const express = require('express')
const router = express.Router()
const currenciesController = require('../controllers/currencies.controller.js')

router.get('/', currenciesController.getAllCurrencies)

module.exports = router
