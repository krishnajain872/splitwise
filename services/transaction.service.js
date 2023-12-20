// services/currenciesService.js
const { Transaction } = require('../models')
const { Expense } = require('../models')

getAllTransactionByExpenseId = async (payload) => {
    const transaction = await Expense.findAll({
        where: { expense_id: payload },
        attributes: ['category', 'description', 'split_by', 'base_amount'],
        include: [
            {
                Model: Transaction,
                as: 'transaction',
                attributes: ['payer_id', 'payee_id', 'amount', 'currency_id'],
            },
        ],
    })
    return transaction
}
settleUpTransaction = async (payload) => {
    const transaction = await Transaction.findById(payload.transaction_id)
    if (!transaction) {
        const error = Error('Transaction not found')
        error.statusCode = 404
        throw error
    }
    console.log('THE TRANSACTION SETTLEUP ==> ', transaction.dataValues)
    const settle_up_at = new Date()
    const updated = await Transaction.update(
        {
            settle_up_at,
        },
        {
            where: { id: transaction.dataValues.id },
        }
    )
    const response = { ...transaction.dataValues, settle_up_at }
    if (updated) return response
}

settleUpAllTransactionOfExpense = async (payload) => {
    const expense = await Expense.findByPk(payload.id)
    if (!expense) {
        const error = Error('expense not found')
        error.statusCode = 404
        throw error
    }

    const transactions = await Transaction.findAll({
        where: {
            expense_id: payload.id,
        },
    })

    if (!transactions) {
        const error = Error('Transactions not found')
        error.statusCode = 404
        throw error
    }
    // let updated
    const settle_up_at = new Date()
    transactions.map(async (transaction) => {
        updated = await Transaction.update(
            {
                settle_up_at,
            },
            {
                where: { id: transaction.dataValues.id },
            }
        )
    })
    const response = { ...transactions }
    return response
}
module.exports = {
    getAllTransactionByExpenseId,
    settleUpTransaction,
    settleUpAllTransactionOfExpense,
}
