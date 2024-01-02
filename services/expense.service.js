const { Expense } = require('../models')
const { User } = require('../models')
// const { Group } = require('../models')
const { UserGroup } = require('../models')
const { Transaction } = require('../models')
const { Payee } = require('../models')
const { Currency } = require('../models')
const { sequelize } = require('../models')
const simpliyTransaction = require('../helpers/transaction.helper')
const { Op } = require('sequelize')

const addExpense = async (payload) => {
    const t = await sequelize.transaction()
    try {
        let group_id
        let data = []

        if (payload.group_id) {
            const promises = payload.member.map((payee) => {
                return UserGroup.findAll({
                    where: {
                        [Op.and]: [
                            { group_id: payload.group_id },
                            { user_id: payee.user_id },
                        ],
                    },
                })
            })
            data.push(...(await Promise.all(promises)))
        }

        if (data.flat().length != payload.member.length) {
            group_id = null
        } else {
            group_id = payload.group_id
        }

        const expense = await Expense.create(
            {
                base_amount: payload.base_amount,
                split_by: payload.split_by,
                group_id: group_id,
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
        // let Transactions = []
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
        transactionData.forEach((data) => {
            data.amount = data.amount
        })

        const transactionResponse = await Transaction.bulkCreate(
            transactionData,
            {
                transaction: t,
            }
        )
        transactionResponse.map((transaction) => transaction.dataValues)
        await t.commit()
        const expenseData = await Expense.findByPk(expense.dataValues.id, {
            attributes: [
                'base_amount',
                'description',
                'category',
                'group_id',
                'id',
                'split_by',
                'created_at',
            ],
            include: [
                {
                    model: Currency,
                    as: 'expense_currency',
                    attributes: ['code'],
                },
                {
                    model: Payee,
                    as: 'payees',
                    required: true,
                    attributes: ['amount'],
                    include: [
                        {
                            model: User,
                            as: 'user_details',
                            attributes: ['first_name', 'email', 'id', 'mobile'],
                        },
                        {
                            model: User,
                            as: 'user_details',
                            attributes: ['first_name', 'email', 'id', 'mobile'],
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
                            attributes: ['first_name', 'email', 'id', 'mobile'],
                        },
                        {
                            model: User,
                            as: 'payee_details',
                            attributes: ['first_name', 'email', 'id', 'mobile'],
                        },
                    ],
                    attributes: ['id', 'amount', 'settle_up_at'],
                },
            ],
        })
        return expenseData
    } catch (error) {
        await t.rollback()
        throw error
    }
}

const updateExpense = async (payload) => {
    const t = await sequelize.transaction()
    try {
        let group_id
        let data = []

        if (payload.group_id) {
            const promises = payload.member.map((payee) => {
                return UserGroup.findAll({
                    where: {
                        [Op.and]: [
                            { group_id: payload.group_id },
                            { user_id: payee.user_id },
                        ],
                    },
                })
            })
            data.push(...(await Promise.all(promises)))
        }

        if (data.flat().length != payload.member.length) {
            group_id = null
        } else {
            group_id = payload.group_id
        }

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
                group_id: group_id,
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

        // let Transactions = []
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
        transactionData.forEach((data) => {
            data.amount = data.amount
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

        transactionResponse.map((transaction) => transaction.dataValues)
        await t.commit()
        const expenseData = await Expense.findByPk(expense.dataValues.id, {
            attributes: [
                'base_amount',
                'description',
                'category',
                'group_id',
                'id',
                'split_by',
                'created_at',
            ],
            include: [
                {
                    model: Currency,
                    as: 'expense_currency',
                    attributes: ['code'],
                },
                {
                    model: Payee,
                    as: 'payees',
                    required: true,
                    attributes: ['amount'],
                    include: [
                        {
                            model: User,
                            as: 'user_details',
                            attributes: ['first_name', 'email', 'id', 'mobile'],
                        },
                        {
                            model: User,
                            as: 'user_details',
                            attributes: ['first_name', 'email', 'id', 'mobile'],
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
                            attributes: ['first_name', 'email', 'id', 'mobile'],
                        },
                        {
                            model: User,
                            as: 'payee_details',
                            attributes: ['first_name', 'email', 'id', 'mobile'],
                        },
                    ],
                    attributes: ['id', 'amount', 'settle_up_at'],
                },
            ],
        })
        return expenseData
    } catch (error) {
        await t.rollback()
        throw error
    }
}

const deleteExpense = async (payload) => {
    const t = await sequelize.transaction()
    try {
        const existingExpense = await Expense.findOne(
            {
                include: {
                    model: Transaction,
                    as: 'transaction',
                },
                where: { id: payload.expense_id },
            },
            { transaction: t }
        )
        if (!existingExpense) {
            const error = Error('Expense not found')
            error.statusCode = 404
            throw error
        }

        let totalPendingAmount = 0
        existingExpense.transaction.forEach((transaction) => {
            if (transaction.settle_up_at === null)
                totalPendingAmount += Number(transaction.dataValues.amount)
        })

        if (totalPendingAmount > 0) {
            const error = Error('Expense contain pending Transactions')
            error.statusCode = 409
            throw error
        }

        await Expense.destroy({ where: { id: payload.expense_id } })
        await Payee.destroy({ where: { id: payload.expense_id } })
        await Transaction.destroy({ where: { id: payload.expense_id } })

        await t.commit()
        return true
    } catch (error) {
        await t.rollback()
        throw error
    }
}

const getTotalAmountOwedByCurrentUserForParticularGroup = async (payload) => {
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
            {
                model: Expense,
                as: 'expense_details',
                required: true,
                attributes: [
                    'base_amount',
                    'description',
                    'category',
                    'group_id',
                    'id',
                    'split_by',
                ],
                where: { group_id: { [Op.ne]: null } },
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

    const total_amount_owed =
        totalPayeeAmount.toFixed(2) - totalPayerAmount.toFixed(2)

    return { transactions: [...transactions], total_amount_owed }
}

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
                { deleted_at: null },
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
            {
                model: Expense,
                as: 'expense_details',
                attributes: ['base_amount', 'id', 'category', 'description'],
            },
        ],
        attributes: ['id', 'amount', 'payer_id', 'payee_id', 'settle_up_at'],
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

    const total_amount_owed =
        totalPayeeAmount.toFixed(2) - totalPayerAmount.toFixed(2)

    return { transactions: [...transactions], total_amount_owed }
}

const getAllPendingExpensesByUser = async (user_id) => {
    const payeeExpenses = await Payee.findAll({
        where: { user_id },
        attributes: ['expense_id'],
    })

    // Extract the expense IDs
    const expenseIds = payeeExpenses.map((payee) => payee.expense_id)

    // Then, find all the expenses with those IDs
    const expenses = await Expense.findAll({
        where: { id: expenseIds },
        attributes: [
            'description',
            'category',
            'created_at',
            'split_by',
            'base_amount',
            'group_id',
            'id',
        ],
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
                        attributes: ['first_name', 'email', 'mobile', 'id'],
                    },
                    {
                        model: User,
                        as: 'user_details',
                        attributes: ['first_name', 'email', 'mobile', 'id'],
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
                        attributes: ['first_name', 'email', 'mobile', 'id'],
                    },
                    {
                        model: User,
                        as: 'payee_details',
                        attributes: ['first_name', 'email', 'mobile', 'id'],
                    },
                    {
                        model: Currency,
                        as: 'currency_details',
                        attributes: ['code'],
                    },
                ],
                attributes: ['amount', 'id', 'settle_up_at'],
            },
        ],
    })

    return expenses
}
const getAllPendingNonGroupExpensesByCurrentUser = async (user_id) => {
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
                    'id',
                    'split_by',
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
            expenseIds.push(payee.expense_details.id)
        }
    })
    console.log('THIS IS PAYEEE => ', expenseIds)
    // Then, find all the expenses with those IDs
    const expenses = await Expense.findAll({
        where: { id: expenseIds, group_id: null },
        attributes: [
            'base_amount',
            'description',
            'category',
            'created_at',
            'group_id',
            'id',
            'split_by',
        ],
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
                        attributes: ['first_name', 'email', 'id', 'mobile'],
                    },
                    {
                        model: User,
                        as: 'user_details',
                        attributes: ['first_name', 'email', 'id', 'mobile'],
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
                        attributes: ['first_name', 'email', 'id', 'mobile'],
                    },
                    {
                        model: User,
                        as: 'payee_details',
                        attributes: ['first_name', 'email', 'id', 'mobile'],
                    },
                    {
                        model: Currency,
                        as: 'currency_details',
                        attributes: ['code'],
                    },
                ],
                attributes: ['id', 'amount', 'settle_up_at'],
            },
        ],
    })

    return expenses
}
const getAllPendingGroupExpensesByCurrentUser = async (user_id) => {
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
                    'id',
                    'split_by',
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
            expenseIds.push(payee.expense_details.id)
        }
    })

    // Then, find all the expenses with those IDs
    const expenses = await Expense.findAll({
        where: { id: expenseIds },
        attributes: [
            'base_amount',
            'description',
            'created_at',
            'category',
            'group_id',
            'id',
            'split_by',
        ],
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
                        attributes: ['first_name', 'email', 'id', 'mobile'],
                    },
                    {
                        model: User,
                        as: 'user_details',
                        attributes: ['first_name', 'email', 'id', 'mobile'],
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
                        attributes: ['first_name', 'email', 'id', 'mobile'],
                    },
                    {
                        model: User,
                        as: 'payee_details',
                        attributes: ['first_name', 'email', 'id', 'mobile'],
                    },
                    {
                        model: Currency,
                        as: 'currency_details',
                        attributes: ['code'],
                    },
                ],
                attributes: ['id', 'amount', 'settle_up_at'],
            },
        ],
    })
    return expenses
}
const getAllPendingGroupExpensesByCurrentGroup = async (group_id) => {
    // Then, find all the expenses with those IDs
    const expenses = await Expense.findAll({
        where: { group_id },
        attributes: [
            'base_amount',
            'description',
            'category',
            'group_id',
            'id',
            'created_at',
            'split_by',
        ],
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
                        attributes: ['first_name', 'email', 'id', 'mobile'],
                    },
                    {
                        model: User,
                        as: 'user_details',
                        attributes: ['first_name', 'email', 'id', 'mobile'],
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
                        attributes: ['first_name', 'email', 'id', 'mobile'],
                    },
                    {
                        model: User,
                        as: 'payee_details',
                        attributes: ['first_name', 'email', 'id', 'mobile'],
                    },
                    {
                        model: Currency,
                        as: 'currency_details',
                        attributes: ['code'],
                    },
                ],
                attributes: ['id', 'amount', 'settle_up_at'],
            },
        ],
    })

    return expenses
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
        attributes: [
            'description',
            'category',
            'split_by',
            'base_amount',
            'group_id',
            'created_at',
            'id',
        ],
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
                        attributes: ['first_name', 'email', 'mobile', 'id'],
                    },
                    {
                        model: User,
                        as: 'user_details',
                        attributes: ['first_name', 'email', 'mobile', 'id'],
                    },
                ],
            },
            {
                model: Transaction,
                as: 'transaction',
                // where: { settle_up_at: null },
                include: [
                    {
                        model: User,
                        as: 'payer_details',
                        attributes: ['first_name', 'email', 'mobile', 'id'],
                    },
                    {
                        model: User,
                        as: 'payee_details',
                        attributes: ['first_name', 'email', 'mobile', 'id'],
                    },
                    {
                        model: Currency,
                        as: 'currency_details',
                        attributes: ['code'],
                    },
                ],
                attributes: ['amount', 'id', 'settle_up_at'],
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
                    'id',
                    'split_by',
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
            expenseIds.push(payee.expense_details.id)
        }
    })
    console.log('THIS IS PAYEEE => ', expenseIds)
    // Then, find all the expenses with those IDs
    const expenses = await Expense.findAll({
        where: { id: expenseIds, group_id: null },
        attributes: [
            'base_amount',
            'description',
            'category',
            'group_id',
            'id',
            'created_at',
            'split_by',
        ],
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
                        attributes: ['first_name', 'email', 'id', 'mobile'],
                    },
                    {
                        model: User,
                        as: 'user_details',
                        attributes: ['first_name', 'email', 'id', 'mobile'],
                    },
                ],
            },
            {
                model: Transaction,
                as: 'transaction',
                // where: { settle_up_at: null },
                include: [
                    {
                        model: User,
                        as: 'payer_details',
                        attributes: ['first_name', 'email', 'id', 'mobile'],
                    },
                    {
                        model: User,
                        as: 'payee_details',
                        attributes: ['first_name', 'email', 'id', 'mobile'],
                    },
                    {
                        model: Currency,
                        as: 'currency_details',
                        attributes: ['code'],
                    },
                ],
                attributes: ['id', 'amount', 'settle_up_at'],
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
                    'id',
                    'split_by',
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
            expenseIds.push(payee.expense_details.id)
        }
    })

    // Then, find all the expenses with those IDs
    const expenses = await Expense.findAll({
        where: { id: expenseIds },
        attributes: [
            'base_amount',
            'description',
            'category',
            'group_id',
            'id',
            'created_at',
            'split_by',
        ],
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
                        attributes: ['first_name', 'email', 'id', 'mobile'],
                    },
                    {
                        model: User,
                        as: 'user_details',
                        attributes: ['first_name', 'email', 'id', 'mobile'],
                    },
                ],
            },
            {
                model: Transaction,
                as: 'transaction',
                // where: { settle_up_at: null },
                include: [
                    {
                        model: User,
                        as: 'payer_details',
                        attributes: ['first_name', 'email', 'id', 'mobile'],
                    },
                    {
                        model: User,
                        as: 'payee_details',
                        attributes: ['first_name', 'email', 'id', 'mobile'],
                    },
                    {
                        model: Currency,
                        as: 'currency_details',
                        attributes: ['code'],
                    },
                ],
                attributes: ['id', 'amount', 'settle_up_at'],
            },
        ],
    })

    return expenses
}
const getAllGroupExpensesByCurrentGroup = async (group_id) => {
    // Then, find all the expenses with those IDs
    const expenses = await Expense.findAll({
        where: { group_id },
        attributes: [
            'base_amount',
            'description',
            'category',
            'group_id',
            'id',
            'created_at',
            'split_by',
        ],
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
                        attributes: ['first_name', 'email', 'id', 'mobile'],
                    },
                    {
                        model: User,
                        as: 'user_details',
                        attributes: ['first_name', 'email', 'id', 'mobile'],
                    },
                ],
            },
            {
                model: Transaction,
                as: 'transaction',
                // where: { settle_up_at: null },
                include: [
                    {
                        model: User,
                        as: 'payer_details',
                        attributes: ['first_name', 'email', 'id', 'mobile'],
                    },
                    {
                        model: User,
                        as: 'payee_details',
                        attributes: ['first_name', 'email', 'id', 'mobile'],
                    },
                    {
                        model: Currency,
                        as: 'currency_details',
                        attributes: ['code'],
                    },
                ],
                attributes: ['id', 'amount', 'settle_up_at'],
            },
        ],
    })

    return expenses
}
module.exports = {
    addExpense,
    updateExpense,
    deleteExpense,
    getTotalAmountOwedByCurrentUserForParticularGroup,
    getTotalAmountOwedByCurrentUser,
    getAllExpensesByUser,
    getAllNonGroupExpensesByCurrentUser,
    getAllGroupExpensesByCurrentUser,
    getAllGroupExpensesByCurrentGroup,
    getAllPendingExpensesByUser,
    getAllPendingNonGroupExpensesByCurrentUser,
    getAllPendingGroupExpensesByCurrentUser,
    getAllPendingGroupExpensesByCurrentGroup,
}
