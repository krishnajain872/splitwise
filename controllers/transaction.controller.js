const { errorHelper } = require('../helpers/commonResponse.helper')
const transactionService = require('../services/transaction.service')

const getAllTransactionByExpenseId = async (req, res, next) => {
    try {
        const { expense_id: payload } = req.params.value
        const data =
            await transactionService.getAllTransactionByExpenseId(payload)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}

const settleUpAllTransactionOfExpense = async (req, res, next) => {
    try {
        const { id, expense_id } = req.params.value
        const payload = {
            id,
            expense_id,
        }
        const data =
            await transactionService.settleUpAllTransactionOfExpense(payload)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}
const settleUpTransaction = async (req, res, next) => {
    try {
        const { expense_id, transaction_id } = req.params.value
        const user_id = req.user.id
        const payload = {
            expense_id,
            transaction_id,
            user_id,
        }

        console.log(
            'THIS IS PAYLAOD OF THE SETTLE TRANSACTION CONTROLLER ==> ',
            payload
        )
        const data = await transactionService.settleUpTransaction(payload)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}

module.exports = {
    getAllTransactionByExpenseId,
    settleUpTransaction,
    settleUpAllTransactionOfExpense,
}
