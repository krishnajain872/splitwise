const { Expense } = require('../models')
const { User } = require('../models')
const { Group } = require('../models')
const { Transaction } = require('../models')
const { Payee } = require('../models')
const { Currency } = require('../models')
const { sequelize } = require('../models')
const simpliyTransaction = require('../helpers/transaction.helper')
const { Op } = require('sequelize')

// const { Group } = require('../models')

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
        console.log('expense ==> ', expense)
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
            transactionData = simpliyTransaction.calculateTransactionsByShare(
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
            transactionData = simpliyTransaction.calculateTransactionsByShare(
                payload.base_amount,
                allPayeeData
            )
        }
        transactionData.forEach((data) => {
            data.amount = Math.round(data.amount)
        })

        if (!transactionData) {
            const error = Error('Faild to calculate data')
            error.statusCode = 422
            throw error
        }

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

const deleteExpense = async (payload) => {
    console.log('THIS IS DELETE PAYLOAD :: From service ==>> ', payload)
    const t = await sequelize.transaction()
    try {
        const existingExpense = await Expense.findOne(
            {
                include: {
                    model: Transaction,
                    as: 'transaction',
                    where: { settle_up_at: null },
                },
                where: { id: payload.expense_id },
            },
            { transaction: t }
        )

        if (!existingExpense) {
            throw new NotFoundError('Expense Not Found')
        }

        let totalPendingAmount = 0
        existingExpense.transaction.forEach((transaction) => {
            totalPendingAmount += Number(transaction.dataValues.amount)
        })

        if (totalPendingAmount > 0) {
            const error = Error('Expense contain pending Transactions')
            error.statusCode = 409
            throw error
        }

        await deleteRecords('Expense', payload.expense_id, t)
        await deleteRecords('Transaction', payload.expense_id, t)
        await deleteRecords('Payee', payload.expense_id, t)

        await t.commit()
        return true
    } catch (error) {
        await t.rollback()
        throw error
    }
}

// const getExpenseById = async (payload) => {}

// const getPendingExpenseByCurrentUser = async (payload) => {
//     const existingExpense = await Expense.findAll({
//         include: [
//             {
//                 model: Transaction,
//                 as: 'transaction',
//                 where: {
//                     [Op.and]: [
//                         {
//                             [Op.or]: [
//                                 { payer_id: payload.user_id },
//                                 { payee_id: payload.user_id },
//                             ],
//                         },
//                         { settle_up_at: null },
//                     ],
//                 },
//                 include: [
//                     {
//                         model: User,
//                         as: 'payer_details',
//                         attributes: ['first_name', 'email', 'mobile'],
//                     },
//                     {
//                         model: User,
//                         as: 'payee_details',
//                         attributes: ['first_name', 'email', 'mobile'],
//                     },
//                     {
//                         model: Currency,
//                         as: 'currency_details',
//                         attributes: ['code'],
//                     },
//                 ],
//                 attributes: ['id', 'amount'],
//             },
//             {
//                 model: Group,
//                 as: 'group_details',
//                 attributes: ['title', 'category'], // Removed 'description'
//             },
//         ],
//         attributes: ['description', 'category', 'id', 'base_amount'],
//     })

//     return existingExpense.map((expense) => expense.get({ plain: true }))
// }

const getTotalAmountOwedByCurrentUser = async (payload) => {
    const transactions = await Transaction.findAll({
        where: {
            [Op.and]: [
                {
                    [Op.or]: [
                        { payer_id: payload.user_id },
                        { payee_id: payload.user_id },
                    ],
                },
                { settle_up_at: null },
            ],
        },
        include: [
            {
                model: User,
                as: 'payer_details',
                attributes: ['first_name', 'email', 'mobile'],
            },
            {
                model: User,
                as: 'payee_details',
                attributes: ['first_name', 'email', 'mobile'],
            },
            {
                model: Currency,
                as: 'currency_details',
                attributes: ['code'],
            },
        ],
        attributes: ['id', 'amount', 'payer_id', 'payee_id'],
    })

    let totalPayeeAmount = 0
    let totalPayerAmount = 0

    transactions.forEach((transaction) => {
        const { amount, payer_id } = transaction.get({ plain: true })

        if (payer_id === payload.user_id) {
            totalPayerAmount += Number(amount)
        } else {
            totalPayeeAmount += Number(amount)
        }
    })

    const total_amount_owed = totalPayeeAmount - totalPayerAmount

    return { ...transactions, total_amount_owed }
}
// const getExpenseByGroupId = async (payload) => {}

const getExpenseByGroup = async (payload) => {
    const existingExpense = await Expense.findAll({
        where: { group_id: payload },
        attributes: [
            'description',
            'category',
            'id',
            'group_id',
            'base_amount',
        ],

        include: [
            {
                model: Transaction,
                as: 'transaction',
                where: { settle_up_at: null },
                include: [
                    {
                        model: User,
                        as: 'payer_details',
                        attributes: ['first_name', 'email', 'mobile'],
                    },
                    {
                        model: User,
                        as: 'payee_details',
                        attributes: ['first_name', 'email', 'mobile'],
                    },
                ],
            },
        ],
    })
    return existingExpense
}
const getAllExpensesByUser = async (user_id) => {
    const payeeExpenses = await Payee.findAll({
        where: { user_id },
        attributes: ['expense_id'],
    })

    // Extract the expense IDs
    const expenseIds = payeeExpenses.map((payee) => payee.expense_id)

    // Then, find all the expenses with those IDs
    const expenses = await Expense.findAll({
        where: { id: expenseIds },
        attributes: ['description', 'category', 'base_amount', 'group_id'],
        include: [
            {
                model: Payee,
                as: 'payees',
                required: true,
                attributes: ['amount'],
                include: [
                    {
                        model: User,
                        as: 'user_details',
                        attributes: ['first_name', 'email', 'mobile'],
                    },
                    {
                        model: User,
                        as: 'user_details',
                        attributes: ['first_name', 'email', 'mobile'],
                    },
                ],
            },
            {
                model: Transaction,
                as: 'transaction',
                where: { settle_up_at: null },
                include: [
                    {
                        model: User,
                        as: 'payer_details',
                        attributes: ['first_name', 'email', 'mobile'],
                    },
                    {
                        model: User,
                        as: 'payee_details',
                        attributes: ['first_name', 'email', 'mobile'],
                    },
                    {
                        model: Currency,
                        as: 'currency_details',
                        attributes: ['code', 'exchange_rate'],
                    },
                ],
                attributes: ['amount'],
            },
        ],
    })

    return expenses
}
const getAllNonGroupExpensesByCurrentUser = async (user_id) => {
    const payeeExpenses = await Payee.findAll({
        where: { user_id },
        include: [
            {
                model: Expense,
                as: 'expense_details',
                required: true,
                attributes: [
                    'base_amount',
                    'description',
                    'category',
                    'group_id',
                ],
            },
        ],
        attributes: ['expense_id'],
    })
    // Extract the expense IDs
    const expenseIds = []
    payeeExpenses.map((payee) => {
        // only non-group expenses
        if (!payee.expense_details.dataValues.group_id) {
            expenseIds.push(payee.expense_id)
        }
    })
    // Then, find all the expenses with those IDs
    const expenses = await Expense.findAll({
        where: { id: expenseIds, group_id: null },
        attributes: ['description', 'category', 'base_amount'],
        include: [
            {
                model: Payee,
                as: 'payees',
                required: true,
                attributes: ['amount'],
                include: [
                    {
                        model: User,
                        as: 'user_details',
                        attributes: ['first_name', 'email', 'mobile'],
                    },
                    {
                        model: User,
                        as: 'user_details',
                        attributes: ['first_name', 'email', 'mobile'],
                    },
                ],
            },
            {
                model: Transaction,
                as: 'transaction',
                where: { settle_up_at: null },
                include: [
                    {
                        model: User,
                        as: 'payer_details',
                        attributes: ['first_name', 'email', 'mobile'],
                    },
                    {
                        model: User,
                        as: 'payee_details',
                        attributes: ['first_name', 'email', 'mobile'],
                    },
                    {
                        model: Currency,
                        as: 'currency_details',
                        attributes: ['code', 'exchange_rate'],
                    },
                ],
                attributes: ['amount'],
            },
        ],
    })

    return expenses
}
const getAllGroupExpensesByCurrentUser = async (user_id) => {
    const payeeExpenses = await Payee.findAll({
        where: { user_id },
        include: [
            {
                model: Expense,
                as: 'expense_details',
                required: true,
                attributes: [
                    'base_amount',
                    'description',
                    'category',
                    'group_id',
                ],
            },
        ],
        attributes: ['expense_id'],
    })
    // Extract the expense IDs
    const expenseIds = []
    payeeExpenses.map((payee) => {
        // only non-group expenses
        if (payee.expense_details.dataValues.group_id) {
            expenseIds.push(payee.expense_id)
        }
    })
    // Then, find all the expenses with those IDs
    const expenses = await Expense.findAll({
        where: { id: expenseIds, group_id: null },
        attributes: ['description', 'category', 'base_amount'],
        include: [
            {
                model: Payee,
                as: 'payees',
                required: true,
                attributes: ['amount'],
                include: [
                    {
                        model: User,
                        as: 'user_details',
                        attributes: ['first_name', 'email', 'mobile'],
                    },
                    {
                        model: User,
                        as: 'user_details',
                        attributes: ['first_name', 'email', 'mobile'],
                    },
                ],
            },
            {
                model: Transaction,
                as: 'transaction',
                where: { settle_up_at: null },
                include: [
                    {
                        model: User,
                        as: 'payer_details',
                        attributes: ['first_name', 'email', 'mobile'],
                    },
                    {
                        model: User,
                        as: 'payee_details',
                        attributes: ['first_name', 'email', 'mobile'],
                    },
                    {
                        model: Currency,
                        as: 'currency_details',
                        attributes: ['code', 'exchange_rate'],
                    },
                ],
                attributes: ['amount'],
            },

            {
                model: Group,
                as: 'group_details',
                required: true,
                attributes: ['title', 'category', 'admin_id'],
                include: [
                    {
                        model: User,
                        as: 'admin_details',
                        attributes: ['first_name', 'email', 'mobile'],
                    },
                ],
            },
        ],
    })

    return expenses
}
module.exports = {
    addExpense,
    updateExpense,
    deleteExpense,
    // getExpenseById,
    // getPendingExpenseByUser,
    // getExpense,
    getTotalAmountOwedByCurrentUser,
    getExpenseByGroup,
    getAllExpensesByUser,
    getAllNonGroupExpensesByCurrentUser,
    getAllGroupExpensesByCurrentUser,
}
