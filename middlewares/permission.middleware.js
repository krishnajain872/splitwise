const { User } = require('../models')
const { Group } = require('../models')
const { UserGroup } = require('../models')
const { Expense } = require('../models')
const { Transaction } = require('../models')

const { errorHelper } = require('../helpers/commonResponse.helper')

// all the permission for admin are going to be check by this
const checkPermission = async (req, res, next) => {
    try {
        const { id: group_id } = req.params.value
        const { id: admin_id } = req.user
        console.log({ group_id, admin_id })
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
        console.log(error)
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}

// all the permissions check by this for only verified user
const checkPermissionByRegistrationStatus = async (req, res, next) => {
    try {
        const { id: user_id } = req.user
        console.log({ user_id })
        const existingUser = await User.findOne({
            where: {
                id: user_id,
            },
        })
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
        const { id: group_id } = req.body.value
        console.log({ user_id, group_id })
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
            const error = new Error('user not found')
            error.statusCode = 404
            throw error
        }
        if (
            existingUser.user_details.status === 'dummy' ||
            existingUser.user_details.status === 'unVerified'
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

const checkPermissionByTransactionDebt = async (req, res, next) => {
    try {
        const { id: group_id } = req.params.value
        const existingGroup = await Group.findByPk(group_id)
        console.log('CHECK PERMISSION TRANSACTION  ===>>>  ', group_id)
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
        console.log(
            'THIS IS CHECK TOTAL PENDING AMOUND ===>>  ',
            totalPendingAmount
        )
        if (totalPendingAmount > 0) {
            const error = new Error('pending debts in group')
            error.statusCode = 409
            throw error
        } else {
            next()
        }
    } catch (error) {
        console.log('CHECK PERMISSION ERROR', error)
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}

module.exports = {
    checkPermission,
    checkPermissionByRegistrationStatus,
    checkPermissionByTransactionDebt,
    checkPermissionByValidGroupMember,
}
