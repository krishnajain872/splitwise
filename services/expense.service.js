const { Expense } = require('../models')
const { Transaction } = require('../models')
const { Payee } = require('../models')
const { sequelize } = require('../models')
const simpliyTransaction = require('../helpers/transaction.helper')

const addExpense = async (payload) => {
    console.log('PAYLOAD FOR EXPENSE ADD FROM SERVICE ==>', payload)
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
            const error = Error(
                'Expense base Amount and total amount of pay by all payee is unequal'
            )
            error.statusCode = 409
            throw error
        }

        const payeePayload = payload.member.map((member) => ({
            ...member,
            currency_id: payload.currency_id,
            expense_id: expense.dataValues.id,
        }))

        const payees = await Payee.bulkCreate(payeePayload, { transaction: t })

        let allPayeeData = payees.map((payee) => payee.dataValues)

        let Transactions = []
        let transactionData
        if (payload.split_by === 'equal') {
            transactionData = simpliyTransaction.calculateTransactions(
                payload.base_amount,
                allPayeeData
            )
        } else if (payload.split_by === 'share') {
            const totalAmount = payload.member.reduce(
                (sum, member) => sum + Number(member.share),
                0
            )

            if (Number(payload.base_amount) !== totalAmount) {
                const error = Error(
                    'Expense base Amount and total amount of share by all payee is unequal'
                )
                error.statusCode = 409
                throw error
            }
            transactionData = simpliyTransaction.calculateTransactions(
                payload.base_amount,
                allPayeeData
            )
        }
        if (!transactionData) {
            const error = Error('Faild to calculate data')
            error.statusCode = 422
            throw error
        }

        console.log('THIS IS TRANSACTION DATA ===>> ', transactionData)

        transactionData.forEach((data) => {
            data.amount = Math.round(data.amount)
        })

        const transactionResponse = await Transaction.bulkCreate(
            transactionData,
            {
                transaction: t,
            }
        )
        Transactions = transactionResponse.map(
            (transaction) => transaction.dataValues
        )
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
            const error = Error('Expense not Found')
            error.statusCode = 404
            throw error
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
            const error = Error(
                'Expense base Amount and total amount of pay by all payee is unequal'
            )
            error.statusCode = 409
            throw error
        }

        const payeePayload = payload.member.map((member) => ({
            ...member,
            currency_id: payload.currency_id,
            expense_id: expense.id,
        }))

        const payees = await Payee.bulkCreate(payeePayload, { transaction: t })

        let allPayeeData = payees.map((payee) => payee.dataValues)

        let Transactions = []
        let transactionData
        if (payload.split_by === 'equal') {
            transactionData = simpliyTransaction.calculateTransactions(
                payload.base_amount,
                allPayeeData
            )
        } else if (payload.split_by === 'share') {
            const totalAmount = payload.member.reduce(
                (sum, member) => sum + Number(member.share),
                0
            )

            if (Number(payload.base_amount) !== totalAmount) {
                const error = Error(
                    'Expense base Amount and total amount of pay by all payee is unequal'
                )
                error.statusCode = 409
                throw error
            }
            transactionData = simpliyTransaction.calculateTransactions(
                payload.base_amount,
                allPayeeData
            )
        }
        transactionData.forEach((data) => {
            data.amount = Math.round(data.amount)
        })

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
