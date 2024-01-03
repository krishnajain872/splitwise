const { Router } = require('express')

const groupController = require('../controllers/group.controller')
const transactionController = require('../controllers/transaction.controller')
const groupPermission = require('../middlewares/permission.middleware')
const groupValidator = require('../validators/group.validator.js')
const genericResponse = require('./../helpers/commonResponse.helper')
const { checkAccessToken } = require('../middlewares/auth.middleware')
const groupSerializer = require('../serializers/group.serializers')
const groupExpenseSerializer = require('../serializers/user.serializer')
// const commentController = require('../controllers/comment.controller')
// const userSerializer = require('../serializers/user.serializer')
const router = Router()

// router.post(
//     '/:id/expense/:expense_id/comment/',
//     checkAccessToken,
//     groupValidator.expenseIdCheck,
//     groupValidator.commentSchema,
//     groupPermission.checkPermissionByValidGroupMember,
//     groupPermission.checkPermissionByValidExpenseMember,
//     commentController.addComment,
//     userSerializer.addComment,
//     genericResponse.responseHelper
// )
// router.patch(
//     '/:id/expense/:expense_id/comment/:comment_id',
//     checkAccessToken,
//     groupValidator.expenseIdCheck,
//     groupValidator.commentSchema,
//     groupPermission.checkPermissionByValidGroupMember,
//     groupPermission.checkPermissionByValidExpenseMember,
//     commentController.udpateComment,
//     userSerializer.addComment,
//     genericResponse.responseHelper
// )
// router.get(
//     '/id:/expense/:expense_id/comment/:id',
//     checkAccessToken,
//     expenseValidator.commentIdSchema,
//     permission.checkPermissionByValidExpenseMember,
//     commentController.getCommentById,
//     userSerializer.addComment,
//     genericResponse.responseHelper
// )
// router.get(
//     '/id:/expense/:expense_id/my/comment',
//     checkAccessToken,
//     expenseValidator.commentIdSchema,
//     permission.checkPermissionByValidExpenseMember,
//     commentController.getCommentByUserId,
//     userSerializer.getCommentByUser,
//     genericResponse.responseHelper
// )
// router.get(
//     '/id:/expense/:expense_id/comments',
//     checkAccessToken,
//     expenseValidator.commentIdSchema,
//     permission.checkPermissionByValidExpenseMember,
//     commentController.getCommentByExpenseId,
//     userSerializer.getCommentByExpense,
//     genericResponse.responseHelper
// )

router.post(
    '/',
    checkAccessToken,
    groupPermission.checkPermissionByRegistrationStatus,
    groupValidator.createGroupSchema,
    groupController.createGroup,
    groupSerializer.createGroup,
    genericResponse.responseHelper
)
router.post(
    '/:id/members/add',
    checkAccessToken,
    groupValidator.paramsIdCheck,
    groupPermission.checkPermissionByValidGroupMember,
    groupValidator.addMemberSchema,
    groupController.addMember,
    groupSerializer.addMembers,
    genericResponse.responseHelper
)
router.delete(
    '/:id/member/remove/:user_id',
    checkAccessToken,
    groupValidator.paramsIdCheck,
    groupPermission.checkPermissionByValidGroupMember,
    groupController.removeMember,
    groupSerializer.removeMember,
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
    groupSerializer.findGroups,
    genericResponse.responseHelper
)
router.get(
    '/:id/members',
    checkAccessToken,
    groupValidator.paramsIdCheck,
    groupPermission.checkPermissionByValidGroupMember,
    groupController.findAllMemberForGroup,
    groupSerializer.findGroupMembers,
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
    '/:id/expense/:expense_id',
    checkAccessToken,
    groupValidator.expenseIdCheck,
    groupValidator.expenseSchema,
    groupPermission.checkPermissionByValidGroupMember,
    groupPermission.checkPermissionByValidExpenseMember,
    groupController.updateExpense,
    groupExpenseSerializer.expense,
    genericResponse.responseHelper
)
router.post(
    '/:id/expense/',
    checkAccessToken,
    groupValidator.paramsIdCheck,
    groupValidator.expenseSchema,
    groupPermission.checkPermissionByValidGroupMember,
    groupController.addExpense,
    groupExpenseSerializer.expense,
    genericResponse.responseHelper
)
router.get(
    '/:id/member/expense/amount',
    checkAccessToken,
    groupValidator.paramsIdCheck,
    groupPermission.checkPermissionByValidGroupMember,
    groupController.getTotalAmountOwedByCurrentUserForParticularGroup,
    groupExpenseSerializer.getTotalAmountOwedByCurrentUser,
    genericResponse.responseHelper
)
router.get(
    '/:id/member/expenses',
    checkAccessToken,
    groupValidator.paramsIdCheck,
    groupPermission.checkPermissionByValidGroupMember,
    groupController.getAllGroupExpensesByCurrentUser,
    groupExpenseSerializer.getAllPendingExpensesOfUsers,
    genericResponse.responseHelper
)
router.get(
    '/:id/member/expenses/pending',
    checkAccessToken,
    groupValidator.paramsIdCheck,
    groupPermission.checkPermissionByValidGroupMember,
    groupController.getAllPendingGroupExpensesByCurrentUser,
    groupExpenseSerializer.getAllPendingExpensesOfUsers,
    genericResponse.responseHelper
)
router.get(
    '/:id/expenses',
    checkAccessToken,
    groupValidator.paramsIdCheck,
    groupPermission.checkPermissionByValidGroupMember,
    groupController.getAllGroupExpensesByCurrentGroup,
    groupExpenseSerializer.getAllPendingExpensesOfUsers,
    genericResponse.responseHelper
)
router.get(
    '/:id/expenses/pending',
    checkAccessToken,
    groupValidator.paramsIdCheck,
    groupPermission.checkPermissionByValidGroupMember,
    groupController.getAllPendingGroupExpensesByCurrentGroup,
    groupExpenseSerializer.getAllPendingExpensesOfUsers,
    genericResponse.responseHelper
)
router.get(
    '/:id/expense/:expense_id/transactions/settle-up',
    checkAccessToken,
    groupValidator.expenseIdCheck,
    groupPermission.checkPermission,
    transactionController.settleUpAllTransactionOfExpense,
    groupExpenseSerializer.settleUpAllTransactionsOfExpance,
    genericResponse.responseHelper
)
router.delete(
    '/:id/expense/:expense_id',
    checkAccessToken,
    groupValidator.expenseIdCheck,
    groupPermission.checkPermissionByValidGroupMember,
    groupPermission.checkPermissionByValidExpenseMember,
    groupController.deleteExpense,
    genericResponse.responseHelper
)

module.exports = router
