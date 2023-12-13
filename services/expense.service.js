const { Expense } = require('../models')
const { Transaction } = require('../models')
const { Payee } = require('../models')
const { sequelize } = require('../models')
const simpliyTransaction = require('../helpers/transaction.helper')

const addExpense = async (payload) => {
    console.log('PAYLAOD FOR EXPENSE ADD FROM SERVICE ==>', payload)
    const t = await sequelize.transaction()
    try {
        const expense = await Expense.create(
            {
                base_amount: payload.base_amount,
                split_by: payload.split_by,
                group_id: payload.group_id,
                category: payload.category,
                currency_id: payload.currency_id,
                description: payload.description,
            },
            { transaction: t }
        )

        const totalAmount = payload.member.reduce(
            (sum, member) => sum + Number(member.amount),
            0
        )

        if (Number(payload.base_amount) !== totalAmount) {
            throw Error(
                'Base amount and total amount paid by all payees is unequal',
                { statusCode: 409 }
            )
        }

        const payeePayload = payload.member.map((member) => ({
            ...member,
            currency_id: payload.currency_id,
            expense_id: expense.dataValues.id,
        }))

        const payees = await Payee.bulkCreate(payeePayload, { transaction: t })

        if (!payees) {
            throw Error('Failed to create payees', { statusCode: 500 })
        }

        let allPayeeData = payees.map((payee) => payee.dataValues)

        let Transactions = []
        if (payload.split_by === 'equal') {
            let transactionData = simpliyTransaction.calculateTransactions(
                payload.base_amount,
                allPayeeData
            )

            if (!transactionData) {
                throw Error('Failed to calculate transactions', {
                    statusCode: 500,
                })
            }

            const transactionResponse = await Transaction.bulkCreate(
                transactionData,
                {
                    transaction: t,
                }
            )
            if (!transactionResponse) {
                throw Error('Failed to create transactions', {
                    statusCode: 500,
                })
            }

            Transactions = transactionResponse.map(
                (transaction) => transaction.dataValues
            )
        }

        await t.commit()

        return {
            expense: expense.dataValues,
            allPayeeData,
            Transactions,
        }
    } catch (error) {
        await t.rollback()
        throw error
    }
}
const updateExpense = async (payload) => {
    const t = await sequelize.transaction()
    try {
        console.log('THIS IS UPDATE EXPENSE PAYLOAD FOR =====> ', payload)
        // Fetch the existing expense
        const expense = await Expense.findByPk(payload.expense_id)
        if (!expense) {
            throw Error('Expense not Found', { statusCode: 404 })
        }
        // Update the expense details
        await expense.update(
            {
                base_amount: payload.base_amount,
                split_by: payload.split_by,
                group_id: payload.group_id,
                category: payload.category,
                currency_id: payload.currency_id,
                description: payload.description,
            },
            { transaction: t }
        )

        // Delete all existing payees and transactions related to this expense
        await Payee.destroy({
            where: { expense_id: payload.expense_id },
            transaction: t,
        })
        await Transaction.destroy({
            where: { expense_id: payload.expense_id },
            transaction: t,
        })

        // Recreate the payees and transactions with the new payload
        const totalAmount = payload.member.reduce(
            (sum, member) => sum + Number(member.amount),
            0
        )

        if (Number(payload.base_amount) !== totalAmount) {
            throw Error(
                'Base amount and total amount paid by all payees is unequal',
                { statusCode: 409 }
            )
        }

        const payeePayload = payload.member.map((member) => ({
            ...member,
            currency_id: payload.currency_id,
            expense_id: expense.id,
        }))

        const payees = await Payee.bulkCreate(payeePayload, { transaction: t })

        if (!payees) {
            throw Error('Failed to create payees', { statusCode: 500 })
        }

        let allPayeeData = payees.map((payee) => payee.dataValues)

        let Transactions = []
        if (payload.split_by === 'equal') {
            let transactionData = simpliyTransaction.calculateTransactions(
                payload.base_amount,
                allPayeeData
            )

            if (!transactionData) {
                throw Error('Failed to calculate transactions', {
                    statusCode: 500,
                })
            }

            const transactionResponse = await Transaction.bulkCreate(
                transactionData,
                {
                    transaction: t,
                }
            )
            if (!transactionResponse) {
                throw Error('Failed to create transactions', {
                    statusCode: 500,
                })
            }

            Transactions = transactionResponse.map(
                (transaction) => transaction.dataValues
            )
        }

        await t.commit()

        return {
            expense: expense.dataValues,
            allPayeeData,
            Transactions,
        }
    } catch (error) {
        await t.rollback()
        throw error
    }
}

// const udpateExpense = async (payload) => {}
// const deleteExpense = async (payload) => {}
// const getExpenseById = async (payload) => {}
// const getExpenseByCurrentUser = async (payload) => {}
// const getExpenseByGroupId = async (payload) => {}

module.exports = {
    addExpense,
    updateExpense,
    // deleteExpense,
    // getExpenseById,
    // getExpense,
    // getExpenseByGroup,
}
