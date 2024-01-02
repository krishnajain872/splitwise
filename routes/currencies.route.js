// routes/currencies.js
const express = require('express')
const router = express.Router()
const currenciesController = require('../controllers/currencies.controller.js')
// const permissions = require('../middlewares/permission.middleware.js')
const { checkAccessToken } = require('../middlewares/auth.middleware.js')
const genericResponse = require('./../helpers/commonResponse.helper')
const userSerializer = require('../serializers/user.serializer')
router.get(
    '/',
    checkAccessToken,
    // permissions.checkPermissionByRegistrationStatus,
    currenciesController.getAllCurrencies,
    userSerializer.getAllCurrencies,
    genericResponse.responseHelper
)

module.exports = router
