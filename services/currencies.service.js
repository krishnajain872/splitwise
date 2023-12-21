// services/currenciesService.js
const { Currency } = require('../models')

const getAllCurrencies = async () => {
    const currencies = await Currency.findAll()
    return currencies
}
module.exports = {
    getAllCurrencies,
}
