const { errorHelper } = require('../helpers/commonResponse.helper')
const transactionService = require('../services/transaction.service')

const getAllTransactionByExpenseId = async (req, res, next) => {
    try {
        const { expense_id: payload } = req.params
        const data =
            await transactionService.getAllTransactionByExpenseId(payload)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}
// pending
const getAllTransactionByCurrentUser = async (req, res, next) => {
    try {
        const { expense_id: payload } = req.params
        const data =
            await transactionService.getAllTransactionByCurrentUser(payload)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}
// pending
const getAllTransactionByGroup = async (req, res, next) => {
    try {
        const { expense_id: payload } = req.params
        const data = await transactionService.getAllTransactionByGroup(payload)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}
const settleUpTransaction = async (req, res, next) => {
    try {
        const { transaction_id: payload } = req.params
        const data = await transactionService.settleUpTransaction(payload)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}

module.exports = {
    getAllTransactionByExpenseId,
    getAllTransactionByCurrentUser,
    getAllTransactionByGroup,
    settleUpTransaction,
}
