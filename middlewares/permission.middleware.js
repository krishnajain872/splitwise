const { User } = require('../models')
const { Group } = require('../models')
const { UserGroup } = require('../models')
const { Payee } = require('../models')
const { Expense } = require('../models')
const { Transaction } = require('../models')

const { errorHelper } = require('../helpers/commonResponse.helper')

// all the permission for admin are going to be check by this
const checkPermission = async (req, res, next) => {
    try {
        const { id: group_id } = req.params.value
        const { id: admin_id } = req.user
        const existingGroup = await Group.findByPk(group_id)
        if (!existingGroup) {
            const error = new Error('group not found')
            error.statusCode = 404
            throw error
        }
        const existingAdmin = await User.findByPk(admin_id)
        if (!existingAdmin) {
            const error = new Error('admin not found')
            error.statusCode = 404
            throw error
        }
        if (existingGroup.admin_id === existingAdmin.id) {
            next()
        } else {
            const error = new Error('unAuthorized Access')
            error.statusCode = 403
            throw error
        }
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}

// all the permissions check by this for only verified user
const checkPermissionByRegistrationStatus = async (req, res, next) => {
    try {
        const { id: user_id } = req.user

        const existingUser = await User.findByPk(user_id)
        if (!existingUser) {
            const error = new Error('user not found')
            error.statusCode = 404
            throw error
        }
        if (
            existingUser.status === 'dummy' ||
            existingUser.status === 'unVerified'
        ) {
            const error = new Error('user is not verified')
            error.statusCode = 403
            throw error
        } else {
            next()
        }
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}

// all the permissions check by this for all the valid  group members
const checkPermissionByValidGroupMember = async (req, res, next) => {
    try {
        const { id: user_id } = req.user
        const { id: group_id } = req.params.value
        const existingUser = await UserGroup.findOne({
            include: [
                {
                    model: User,
                    as: 'user_details',
                },
            ],
            where: {
                user_id,
                group_id,
            },
        })
        if (!existingUser) {
            const error = new Error(
                'unAuthorized access user is not part of the group'
            )
            error.statusCode = 403
            throw error
        }
        if (
            existingUser.user_details.status === 'dummy' ||
            existingUser.user_details.status === 'unVerified'
        ) {
            const error = new Error('user is not verified')
            error.statusCode = 401
            throw error
        } else {
            next()
        }
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}
// all the permissions check by this for all the valid  group members
const checkPermissionByValidExpenseMember = async (req, res, next) => {
    try {
        const { id: user_id } = req.user
        const { expense_id: expense } = req.params.value
        const existingExpense = await Expense.findByPk(expense)
        if (!existingExpense) {
            const error = new Error('Expense not found')
            error.statusCode = 404
            throw error
        }
        const existingPayee = await Payee.findOne({
            where: {
                user_id,
                expense_id: expense,
            },
        })
        if (!existingPayee) {
            const error = new Error(
                'unauthorized access user is not part of the expense'
            )
            error.statusCode = 403
            throw error
        }
        const existingUser = await User.findByPk(user_id)
        if (!existingUser) {
            const error = new Error('user not found')
            error.statusCode = 404
            throw error
        }

        if (
            existingUser.status === 'dummy' ||
            existingUser.status === 'unVerified'
        ) {
            const error = new Error('user is not verified')
            error.statusCode = 401
            throw error
        } else {
            next()
        }
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}
const checkPermissionByTransactionDebt = async (req, res, next) => {
    try {
        const { id: group_id } = req.params.value
        const existingGroup = await Group.findByPk(group_id)

        if (!existingGroup) {
            const error = new Error('group not found')
            error.statusCode = 404
            throw error
        }

        let totalPendingAmount = 0

        const groupExpenses = await Expense.findAll({
            where: { group_id },
            include: {
                model: Transaction,
                as: 'transaction',
                where: { settle_up_at: null },
                attributes: ['amount'],
            },
        })

        groupExpenses.forEach((expense) => {
            expense.transaction.forEach((transaction) => {
                totalPendingAmount += Number(transaction.amount)
            })
        })

        if (totalPendingAmount > 0) {
            const error = new Error('pending debts in group')
            error.statusCode = 409
            throw error
        } else {
            next()
        }
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}

const checkPermissionByUserDebt = async (req, res, next) => {
    try {
        const { id: user_id } = req.params.value

        const existingUser = await User.findByPk(user_id)

        if (!existingUser) {
            const error = new Error('user not found')
            error.statusCode = 404
            throw error
        }

        let totalPendingAmount = 0

        const userTransactions = await Transaction.findAll({
            where: {
                [Op.and]: [
                    { settle_up_at: null },
                    {
                        [Op.or]: [{ payer_id: user_id }, { payee_id: user_id }],
                    },
                ],
            },
            include: [
                {
                    Model: Expense,
                    as: 'expense_details',
                    attributes: ['group_id'],
                    where: {
                        group_id: null,
                    },
                },
            ],
            attributes: ['amount', 'payer_id'],
        })

        userTransactions.forEach((transaction) => {
            if (transaction.payer_id === user_id) {
                totalPendingAmount += Number(transaction.amount)
            }
        })

        if (totalPendingAmount > 0) {
            const error = new Error('pending debts for  user')
            error.statusCode = 409
            throw error
        } else {
            next()
        }
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}

module.exports = {
    checkPermission,
    checkPermissionByRegistrationStatus,
    checkPermissionByTransactionDebt,
    checkPermissionByValidGroupMember,
    checkPermissionByUserDebt,
    checkPermissionByValidExpenseMember,
}
