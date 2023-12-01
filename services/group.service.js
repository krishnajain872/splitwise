const { User } = require('../models')
const { Group } = require('../models')
const createGroup = async (payload) => {
    const existingUser = await User.findByPk(payload.admin_id)
    if (!existingUser) {
        const error = new Error('user not found')
        error.statusCode = 404
        throw error
    }
    const group = await Group.create(payload)
    return group.dataValues
}

const deleteGroup = async (payload) => {
    const existingGroup = await Group.findByPk(payload.group_id)
    if (!existingGroup) {
        const error = new Error('group not found')
        error.statusCode = 404
        throw error
    }

    // it also check if all the user debts are settle up or not if not that cannot delete group
    // check code remaining

    await Group.destroy({
        where: { id: payload.group_id },
    })
    return existingGroup
}

const updateGroup = async (payload) => {
    const existingGroup = await Group.findByPk(payload.group_id)
    if (!existingGroup) {
        const error = new Error('group not found')
        error.statusCode = 404
        throw error
    }
    await Group.update(
        { ...existingGroup, rest },
        {
            where: {
                id: existingGroup.id,
            },
        }
    )
    return existingGroup
}
const updateGroupAdmin = async (payload) => {
    const existingGroup = await Group.findByPk(payload.group_id)
    if (!existingGroup) {
        const error = new Error('group not found')
        error.statusCode = 404
        throw error
    }
    const existingUser = await User.findByPk(payload.user_id)
    if (!existingUser) {
        const error = new Error('user not found')
        error.statusCode = 404
        throw error
    }

    await Group.update(
        { ...existingGroup, admin_id: payload.user_id },
        {
            where: {
                id: existingGroup.id,
            },
        }
    )
    existingGroup.admin_id = user_id
    return existingGroup
}

// filters
const findGroupById = async (payload) => {
    const existingGroup = await Group.findByPk(payload.group_id)
    if (!existingGroup) {
        const error = new Error('group not found')
        error.statusCode = 404
        throw error
    }

    return existingGroup.dataValues
}

// findGroupByName
// findGroupByCategory
// findGroupByAdminId

module.exports = {
    createGroup,
    deleteGroup,
    updateGroup,
    updateGroupAdmin,
    findGroupById,
}
