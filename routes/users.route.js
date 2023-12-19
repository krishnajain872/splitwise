// routes/currencies.js
const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller')
const transactionController = require('../controllers/transaction.controller')
const { checkAccessToken } = require('../middlewares/auth.middleware')
const genericResponse = require('./../helpers/commonResponse.helper')
const groupValidator = require('../validators/group.validator.js')
const permission = require('../middlewares/permission.middleware')
router.get(
    '/expenses',
    checkAccessToken,
    userController.getAllExpensesByCurrentUser,
    genericResponse.responseHelper
)
router.get(
    '/expenses/non-group',
    checkAccessToken,
    userController.getAllNonGroupExpensesByCurrentUser,
    genericResponse.responseHelper
)
router.get(
    '/all',
    checkAccessToken,
    permission.checkPermissionByRegistrationStatus,
    userController.getAllUsers,
    genericResponse.responseHelper
)
router.get(
    '/',
    checkAccessToken,
    userController.getCurrentUser,
    genericResponse.responseHelper
)
router.post(
    '/expense/',
    checkAccessToken,
    groupValidator.addExpenseSchema,
    permission.checkPermissionByRegistrationStatus,
    userController.addNonGroupExpense,
    genericResponse.responseHelper
)
router.post(
    '/expense/:id/transaction/:transaction_id/settle-up',
    checkAccessToken,
    permission.checkPermissionByRegistrationStatus,
    transactionController.settleUpTransaction,
    genericResponse.responseHelper
)
router.put(
    '/expense/',
    checkAccessToken,
    groupValidator.udpateExpenseSchema,
    permission.checkPermissionByRegistrationStatus,
    userController.updateNonGroupExpense,
    genericResponse.responseHelper
)
router.delete(
    '/expense/:expense_id',
    checkAccessToken,
    groupValidator.expenseIdCheck,
    permission.checkPermissionByRegistrationStatus,
    userController.deleteNonGroupExpense,
    genericResponse.responseHelper
)
module.exports = router
