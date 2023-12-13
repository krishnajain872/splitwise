// controllers/currenciesController.js
const currenciesService = require('../services/currencies.service.js')

exports.getAllCurrencies = async (req, res, next) => {
    try {
        const currencies = await currenciesService.getAllCurrencies()
        res.status(200).json(currencies)
    } catch (error) {
        next(error)
    }
}
