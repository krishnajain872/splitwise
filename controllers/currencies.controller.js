// controllers/currenciesController.js
const currenciesService = require('../services/currencies.service.js')

const getAllCurrencies = async (req, res, next) => {
    try {
        const currencies = await currenciesService.getAllCurrencies()
        res.status(200).json(currencies)
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getAllCurrencies,
}
