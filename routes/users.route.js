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
    '/expenses/amount',
    checkAccessToken,
    userController.getTotalAmountOwedByCurrentUser,
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
    groupValidator.expenseSchema,
    permission.checkPermissionByRegistrationStatus,
    userController.addNonGroupExpense,
    genericResponse.responseHelper
)
router.post(
    '/friend',
    checkAccessToken,
    groupValidator.addMemberSchema,
    permission.checkPermissionByRegistrationStatus,
    userController.addFriend,
    genericResponse.responseHelper
)
router.delete(
    '/friend/:friend_id',
    checkAccessToken,
    groupValidator.friendIdCheck,
    userController.removeFriend,
    genericResponse.responseHelper
)
router.get(
    '/friend/',
    checkAccessToken,
    userController.getCurrentUserFriend,
    genericResponse.responseHelper
)
router.get(
    '/expense/:expense_id/transaction/:transaction_id/settle-up',
    checkAccessToken,
    groupValidator.transactionIdCheck,
    permission.checkPermissionByValidExpenseMember,
    transactionController.settleUpTransaction,
    genericResponse.responseHelper
)
router.put(
    '/expense/:expense_id',
    checkAccessToken,
    groupValidator.expenseIdCheck,
    groupValidator.expenseSchema,
    permission.checkPermissionByValidExpenseMember,
    userController.updateNonGroupExpense,
    genericResponse.responseHelper
)
router.delete(
    '/expense/:expense_id',
    checkAccessToken,
    groupValidator.expenseIdCheck,
    permission.checkPermissionByValidExpenseMember,
    userController.deleteNonGroupExpense,
    genericResponse.responseHelper
)
module.exports = router
