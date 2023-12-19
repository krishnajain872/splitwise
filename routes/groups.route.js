const { Router } = require('express')

const groupController = require('../controllers/group.controller')
const transactionController = require('../controllers/transaction.controller')
const groupPermission = require('../middlewares/permission.middleware')
const groupValidator = require('../validators/group.validator.js')
const genericResponse = require('./../helpers/commonResponse.helper')
const { checkAccessToken } = require('../middlewares/auth.middleware')

const router = Router()

router.post(
    '/',
    checkAccessToken,
    groupPermission.checkPermissionByRegistrationStatus,
    groupValidator.createGroupSchema,
    groupController.createGroup,
    genericResponse.responseHelper
)
router.post(
    '/:id/member/add',
    checkAccessToken,
    groupValidator.paramsIdCheck,
    groupPermission.checkPermissionByValidGroupMember,
    groupValidator.addMemberSchema,
    groupController.addMember,
    genericResponse.responseHelper
)
router.post(
    '/:id/expense/:expense_id/transaction/settle-up',
    checkAccessToken,
    groupPermission.checkPermissionByRegistrationStatus,
    transactionController.settleUpTransaction,
    genericResponse.responseHelper
)
router.delete(
    '/:id/member/remove/:user_id',
    checkAccessToken,
    groupValidator.paramsIdCheck,
    groupPermission.checkPermissionByValidGroupMember,
    groupController.removeMember,
    genericResponse.responseHelper
)
router.patch(
    '/:id',
    checkAccessToken,
    groupValidator.paramsIdCheck,
    groupValidator.updateGroupSchema,
    groupPermission.checkPermissionByValidGroupMember,
    groupController.updateGroup,
    genericResponse.responseHelper
)
router.get(
    '/',
    checkAccessToken,
    groupPermission.checkPermissionByRegistrationStatus,
    groupController.findAllGroupForCurrentUser,
    genericResponse.responseHelper
)
router.get(
    '/:id/members',
    checkAccessToken,
    groupValidator.paramsIdCheck,
    groupPermission.checkPermissionByValidGroupMember,
    groupController.findAllMemberForGroup,
    genericResponse.responseHelper
)
router.delete(
    '/:id',
    checkAccessToken,
    groupValidator.paramsIdCheck,
    groupPermission.checkPermission,
    groupPermission.checkPermissionByTransactionDebt,
    groupController.deleteGroup,
    genericResponse.responseHelper
)
router.put(
    '/:id/expense/',
    checkAccessToken,
    groupValidator.paramsIdCheck,
    groupValidator.udpateExpenseSchema,
    groupPermission.checkPermissionByValidGroupMember,
    groupController.updateExpense,
    genericResponse.responseHelper
)
router.post(
    '/:id/expense/',
    checkAccessToken,
    groupValidator.paramsIdCheck,
    groupValidator.addExpenseSchema,
    groupPermission.checkPermissionByValidGroupMember,
    groupController.addExpense,
    genericResponse.responseHelper
)
router.get(
    '/:id/member/expense/amount',
    checkAccessToken,
    groupValidator.paramsIdCheck,
    groupPermission.checkPermissionByValidGroupMember,
    groupController.getTotalAmountOwedByCurrentUser,
    genericResponse.responseHelper
)
router.get(
    '/:id/member/expenses',
    checkAccessToken,
    groupValidator.paramsIdCheck,
    groupPermission.checkPermissionByValidGroupMember,
    groupController.getAllGroupExpensesByCurrentUser,
    genericResponse.responseHelper
)
router.delete(
    '/:id/expense/:expense_id',
    checkAccessToken,
    groupValidator.expenseIdCheck,
    groupPermission.checkPermissionByValidGroupMember,
    groupController.deleteExpense,
    genericResponse.responseHelper
)

module.exports = router
