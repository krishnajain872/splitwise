// controllers/currenciesController.js
const currenciesService = require('../services/currencies.service.js')

const getAllCurrencies = async (req, res, next) => {
    try {
        const currencies = await currenciesService.getAllCurrencies()
        res.status(200).json(currencies)
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}

module.exports = {
    getAllCurrencies,
}
