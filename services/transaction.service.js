// services/currenciesService.js
const { Transaction } = require('../models')
const { Expense } = require('../models')

const getAllTransactionByExpenseId = async (payload) => {
    const transaction = await Expense.findAll({
        where: { expense_id: payload },
        attributes: [
            'category',
            'id',
            'description',
            'split_by',
            'base_amount',
        ],
        include: [
            {
                Model: Transaction,
                as: 'transaction',
                attributes: [
                    'payer_id',
                    'id',
                    'payee_id',
                    'amount',
                    'currency_id',
                ],
            },
        ],
    })
    return transaction
}
const settleUpTransaction = async (payload) => {
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

const settleUpAllTransactionOfExpense = async (payload) => {
    const expense = await Expense.findByPk(payload.expense_id)
    console.log('THIS IS SETTLE UP PAYLOAD ==> ', payload.expense_id)
    if (!expense) {
        const error = new Error('Expense not found')
        error.statusCode = 404
        throw error
    }

    let transactions = await Transaction.findAll({
        where: {
            expense_id: payload.expense_id,
        },
        attributes: ['id'],
    })
    if (transactions.length === 0) {
        const error = new Error('Transactions not found')
        error.statusCode = 404
        throw error
    }

    const settle_up_at = new Date()
    transactions = await Promise.all(
        transactions.map(async (transaction) => {
            console.log('THESE ARE THE TRANSACTIONS ==> ', transaction)
            await Transaction.update(
                {
                    settle_up_at,
                },
                {
                    where: { id: transaction.id },
                }
            )
            return transaction
        })
    )

    return transactions
}

module.exports = {
    getAllTransactionByExpenseId,
    settleUpTransaction,
    settleUpAllTransactionOfExpense,
}
