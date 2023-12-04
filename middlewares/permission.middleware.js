const { User } = require('../models')
const { Group } = require('../models')

const checkPermission = () => {
    return async (req, res, next) => {
        try {
            const admin_id = req.user_id
            const group_id = req.group_id

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
            commonErrorHandler(req, res, error.message, res.statusCode, error)
        }
    }
}

const checkPermissionByRegistrationStatus = () => {
    return async (req, res, next) => {
        try {
            const user_id = req.body.user_id
            const existingUser = await User.findByPk(user_id)
            if (!existingUser) {
                const error = new Error('User not found')
                error.statusCode = 404
                throw error
            }
            if (
                existingUser.status === 'dummy' ||
                existingUser.status === 'invited'
            ) {
                const error = new Error('user is not verified')
                error.statusCode = 403
                throw error
            } else {
                next()
            }
        } catch (error) {
            commonErrorHandler(req, res, error.message, res.statusCode, error)
        }
    }
}

const checkPermissionByTransactionDebt = () => {
    return async (req, res, next) => {
        try {
            const group_id = req.body.group_id
            const existingGroup = await User.findByPk(group_id)
            if (!existingGroup) {
                const error = new Error('group not found')
                error.statusCode = 404
                throw error
            }
            // eager loading
            let totalPendingAmount = 0

            const groupExpence = await Group.findAll({
                include: {
                    model: Expense,
                    as: 'group_expenses',
                    include: {
                        model: Transaction,
                        as: 'transaction',
                        where: { settle_up_at: null },
                    },
                },
                where: { id: group_id },
            })
            groupExpence.forEach((group) => {
                group.group_expenses.forEach((expense) => {
                    expense.transaction.forEach((transaction) => {
                        totalPendingAmount =
                            Number(transaction.dataValues.amount) +
                            Number(totalPendingAmount)
                    })
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
            commonErrorHandler(req, res, error.message, res.statusCode, error)
        }
    }
}

module.exports = {
    checkPermission,
    checkPermissionByRegistrationStatus,
    checkPermissionByTransactionDebt,
}
