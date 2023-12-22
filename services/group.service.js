const { User } = require('../models')
const { Group } = require('../models')
const { Transaction } = require('../models')
const { Expense } = require('../models')
const { UserGroup } = require('../models')
const { Op } = require('sequelize')

const createGroup = async (payload) => {
    const existingUser = await User.findByPk(payload.admin_id, {
        attributes: ['first_name', 'last_name', 'id', 'mobile', 'email'],
    })
    if (!existingUser) {
        const error = new Error('user not found')
        error.statusCode = 404
        throw error
    }
    let addAdminInGroup

    const group = await Group.create(payload)
    if (group) {
        addAdminInGroup = await UserGroup.create({
            group_id: group.dataValues.id,
            user_id: payload.admin_id,
        })
    }
    group.dataValues.member = [addAdminInGroup.user_id]
    return group.dataValues
}

const deleteGroup = async (payload) => {
    const existingGroup = await Group.findByPk(payload.id, {
        attributes: ['title', 'category', 'id', 'admin_id'],
    })
    if (!existingGroup || existingGroup.deleted_at != null) {
        const error = new Error('group not found')
        error.statusCode = 404
        throw error
    }
    const deleted = await Group.destroy({
        where: { id: payload.id },
    })

    return deleted
}

const updateGroup = async (payload) => {
    const { id: group_id, ...rest } = payload
    const existingGroup = await Group.findByPk(group_id, {
        attributes: ['title', 'category', 'id', 'admin_id'],
    })
    if (!existingGroup) {
        const error = new Error('group not found')
        error.statusCode = 404
        throw error
    }
    const updatedData = { ...existingGroup.dataValues, ...rest }
    const update = await Group.update(updatedData, { where: { id: group_id } })
    return update
}
// // filters
// const findGroupById = async (payload) => {
//     const existingGroup = await Group.findByPk(payload.group_id, {
//         attributes: ['title', 'category', 'id', 'admin_id'],
//     })
//     if (!existingGroup) {
//         const error = new Error('group not found')
//         error.statusCode = 404
//         throw error
//     }

//     return existingGroup.dataValues
// // }
// const findGroupByName = async (payload) => {
//     const existingGroup = await Group.findOne({
//         where: { name: payload.name },
//         attributes: ['title', 'category', 'id', 'admin_id'],
//     })
//     if (!existingGroup) {
//         const error = new Error('group not found')
//         error.statusCode = 404
//         throw error
//     }

//     return existingGroup.dataValues
// }
// const findGroupByCategory = async (payload) => {
//     const existingGroup = await Group.findOne(payload.name, {
//         attributes: ['title', 'category', 'id', 'admin_id'],
//     })
//     if (!existingGroup) {
//         const error = new Error('group not found')
//         error.statusCode = 404
//         throw error
//     }

//     return existingGroup.dataValues
// }
const findAllGroupForCurrentUser = async (payload) => {
    const existingGroup = await Group.findAll({
        where: { admin_id: payload },
        attributes: ['title', 'category', 'id', 'admin_id'],
    })
    return existingGroup
}
const findAllMemberOfCurrentGroup = async (payload) => {
    const existingGroup = await Group.findByPk(payload, {
        attributes: ['title', 'category', 'id', 'admin_id'],
    })
    if (!existingGroup) {
        const error = new Error('group not found')
        error.statusCode = 404
        throw error
    }
    const members = await UserGroup.findAll({
        include: [
            {
                model: User,
                as: 'user_details',
                attributes: ['first_name', 'mobile', 'id', 'email'],
            },
        ],
        where: { group_id: payload },
        attributes: ['user_id', 'group_id'],
    })

    group_and_members = { ...existingGroup.dataValues, members: [...members] }

    return group_and_members
}
const addMember = async (payload) => {
    const group_id = payload.group_id
    let addedGroupMembers = []

    const existingGroup = await Group.findByPk(group_id, {
        attributes: ['title', 'category', 'id', 'admin_id'],
    })
    if (!existingGroup) {
        const error = new Error('group not found')
        error.statusCode = 404
        throw error
    }
    const userArray = payload.members
    await Promise.all(
        userArray.map(async (user_id, i) => {
            const [existingUser, existingMapping] = await Promise.all([
                User.findByPk(user_id),
                UserGroup.findOne({
                    where: {
                        [Op.and]: [
                            { group_id: group_id },
                            { user_id: user_id },
                        ],
                    },
                }),
            ])
            if (!existingUser) {
                const error = new Error('user not found')
                error.statusCode = 404
                throw error
            }
            if (existingMapping) {
                const error = new Error('user already present in the group')
                error.statusCode = 409
                throw error
            }

            const member = await UserGroup.create({ group_id, user_id })
            addedGroupMembers.push({ [`member_${++i}`]: member.dataValues })
        })
    )

    return addedGroupMembers
}

const removeMember = async (payload) => {
    const existingUser = await User.findByPk(payload.user_id, {
        attributes: ['first_name', 'mobile', 'email', 'status', 'id'],
    })
    if (!existingUser) {
        const error = new Error('User not found')
        error.statusCode = 404
        throw error
    }
    const group = await Group.findByPk(payload.id, {
        attributes: ['admin_id', 'title', 'category', 'id'],
    })
    if (!group) {
        const error = new Error('group not found')
        error.statusCode = 404
        throw error
    }
    if (payload.user_id === group.dataValues.admin_id) {
        const error = new Error('unAuthorized Access , cannot remove admin')
        error.statusCode = 403
        throw error
    }
    const existingGroupUser = await UserGroup.findOne({
        where: {
            [Op.and]: [{ user_id: payload.user_id }, { group_id: payload.id }],
        },

        attributes: ['group_id', 'user_id'],
    })
    if (!existingGroupUser) {
        const error = new Error('user not present in the Group')
        error.statusCode = 404
        throw error
    }

    let totalPendingAmount = 0

    const userTransactions = await Expense.findAll({
        where: {
            group_id: payload.id,
        },
        include: [
            {
                model: Transaction,
                as: 'transaction',
                attributes: [
                    'amount',
                    'id',
                    'settle_up_at',
                    'payer_id',
                    'payee_id',
                ],
                where: {
                    [Op.and]: [
                        { settle_up_at: null },
                        {
                            [Op.or]: [
                                { payer_id: payload.user_id },
                                { payee_id: payload.user_id },
                            ],
                        },
                    ],
                },
            },
        ],
    })

    userTransactions.forEach((transactions) => {
        transactions.transaction.forEach((transaction) => {
            if (
                (transaction.settle_up_at === null &&
                    transaction.payee_id === payload.user_id) ||
                transaction.payer_id === payload.user_id
            ) {
                console.log(transaction.amount)
                totalPendingAmount += Number(transaction.amount)
            }
        })
    })
    if (totalPendingAmount > 0) {
        const error = new Error('pending debts for user')
        error.statusCode = 409
        throw error
    }

    const removedMember = await UserGroup.destroy({
        where: {
            [Op.and]: [{ user_id: payload.user_id }, { group_id: payload.id }],
        },
    })

    let response = {}
    if (removedMember) {
        response.member = existingUser.dataValues
        response.group = group.dataValues
    }

    return response
}
module.exports = {
    createGroup,
    deleteGroup,
    updateGroup,
    // updateGroupAdmin,
    // findGroupById,
    // findGroupByName,
    // findGroupByCategory,
    findAllGroupForCurrentUser,
    addMember,
    removeMember,
    findAllMemberOfCurrentGroup,
}
