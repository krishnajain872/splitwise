// routes/currencies.js
const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller')
const commentController = require('../controllers/comment.controller')
const transactionController = require('../controllers/transaction.controller')
const { checkAccessToken } = require('../middlewares/auth.middleware')
const genericResponse = require('./../helpers/commonResponse.helper')
const expenseValidator = require('../validators/group.validator.js')
const permission = require('../middlewares/permission.middleware')
const userSerializer = require('../serializers/user.serializer')
router.get(
    '/expenses',
    checkAccessToken,
    userController.getAllExpensesByCurrentUser,
    userSerializer.getAllExpensesOfUsers,
    genericResponse.responseHelper
)
router.get(
    '/expenses/non-group',
    checkAccessToken,
    userController.getAllNonGroupExpensesByCurrentUser,
    userSerializer.getAllExpensesOfUsers,
    genericResponse.responseHelper
)
router.get(
    '/expenses/pending',
    checkAccessToken,
    userController.getAllPendingExpensesByCurrentUser,
    userSerializer.getAllPendingExpensesOfUsers,
    genericResponse.responseHelper
)
router.get(
    '/expenses/pending/non-group',
    checkAccessToken,
    userController.getAllPendingNonGroupExpensesByCurrentUser,
    userSerializer.getAllExpensesOfUsers,
    genericResponse.responseHelper
)
router.get(
    '/',
    checkAccessToken,
    permission.checkPermissionByRegistrationStatus,
    userController.getAllUsers,
    userSerializer.getAllUser,
    genericResponse.responseHelper
)
router.get(
    '/expenses/amount',
    checkAccessToken,
    userController.getTotalAmountOwedByCurrentUser,
    userSerializer.getTotalAmountOwedByCurrentUser,
    genericResponse.responseHelper
)
router.get(
    '/me',
    checkAccessToken,
    userController.getCurrentUser,
    userSerializer.getLoginUser,
    genericResponse.responseHelper
)
router.post(
    '/expense/',
    checkAccessToken,
    expenseValidator.expenseSchema,
    permission.checkPermissionByRegistrationStatus,
    userController.addNonGroupExpense,
    userSerializer.expense,
    genericResponse.responseHelper
)
router.post(
    '/expense/:expense_id/comment/',
    checkAccessToken,
    expenseValidator.commentIdSchema,
    expenseValidator.commentSchema,
    permission.checkPermissionByValidExpenseMember,
    commentController.addComment,
    userSerializer.addComment,
    genericResponse.responseHelper
)
router.patch(
    '/expense/:expense_id/comment/:id',
    checkAccessToken,
    expenseValidator.commentIdSchema,
    expenseValidator.commentSchema,
    permission.checkPermissionByValidExpenseMember,
    commentController.udpateComment,
    userSerializer.addComment,
    genericResponse.responseHelper
)
router.get(
    '/expense/:expense_id/comment/:id',
    checkAccessToken,
    expenseValidator.commentIdSchema,
    permission.checkPermissionByValidExpenseMember,
    commentController.getCommentById,
    userSerializer.addComment,
    genericResponse.responseHelper
)
router.get(
    '/expense/:expense_id/my/comment',
    checkAccessToken,
    expenseValidator.commentIdSchema,
    permission.checkPermissionByValidExpenseMember,
    commentController.getCommentByUserId,
    userSerializer.getCommentByUser,
    genericResponse.responseHelper
)
router.get(
    '/expense/:expense_id/comments',
    checkAccessToken,
    expenseValidator.commentIdSchema,
    permission.checkPermissionByValidExpenseMember,
    commentController.getCommentByExpenseId,
    userSerializer.getCommentByExpense,
    genericResponse.responseHelper
)
router.post(
    '/friend',
    checkAccessToken,
    expenseValidator.addMemberSchema,
    permission.checkPermissionByRegistrationStatus,
    userController.addFriend,
    userSerializer.addFriend,
    genericResponse.responseHelper
)
router.delete(
    '/friend/:friend_id',
    checkAccessToken,
    expenseValidator.friendIdCheck,
    userController.removeFriend,
    genericResponse.responseHelper
)
router.get(
    '/friend/:friend_id/transactions',
    checkAccessToken,
    expenseValidator.friendIdCheck,
    userController.getAllPendingExpensesWithFriend,
    userSerializer.totalAmountOwedWithFriend,
    genericResponse.responseHelper
)
router.get(
    '/friend/:friend_id/transactions/settle-up',
    checkAccessToken,
    expenseValidator.friendIdCheck,
    userController.getAllPendingExpensesWithFriendAndSettleup,
    userSerializer.settletotalAmountAndAllExpensesOwedWithFriend,
    genericResponse.responseHelper
)
router.get(
    '/friend/',
    checkAccessToken,
    userController.getCurrentUserFriend,
    userSerializer.getAllFriends,
    genericResponse.responseHelper
)
router.get(
    '/expense/:expense_id/transaction/:transaction_id/settle-up',
    checkAccessToken,
    expenseValidator.transactionIdCheck,
    permission.checkPermissionByValidExpenseMember,
    transactionController.settleUpTransaction,
    userSerializer.settleUpTransaction,
    genericResponse.responseHelper
)
router.put(
    '/expense/:expense_id',
    checkAccessToken,
    expenseValidator.expenseIdCheck,
    expenseValidator.expenseSchema,
    permission.checkPermissionByValidExpenseMember,
    userController.updateNonGroupExpense,
    userSerializer.expense,
    genericResponse.responseHelper
)
router.get(
    '/expense/:expense_id',
    checkAccessToken,
    expenseValidator.expenseIdCheck,
    permission.checkPermissionByValidExpenseMember,
    transactionController.getAllTransactionByExpenseId,
    userSerializer.getAllTransactionofAnExpense,
    genericResponse.responseHelper
)
router.delete(
    '/expense/:expense_id',
    checkAccessToken,
    expenseValidator.expenseIdCheck,
    permission.checkPermissionByValidExpenseMember,
    userController.deleteNonGroupExpense,
    genericResponse.responseHelper
)
module.exports = router
