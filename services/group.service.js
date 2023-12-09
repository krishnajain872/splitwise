const { User } = require('../models')
const { Group } = require('../models')
const createGroup = async (payload) => {
    console.log('GROUP PAYLOAD ====>>> ', payload)
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
    console.log('DELETE SERVICE ===>>. ', payload.id)
    const existingGroup = await Group.findByPk(payload.id)
    if (!existingGroup || existingGroup.deleted_at != null) {
        const error = new Error('group not found')
        error.statusCode = 404
        throw error
    }
    const deleted = await Group.destroy({
        where: { id: payload.id },
    })

    console.log(deleted)
    return deleted
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
    existingGroup.admin_id = payload.user_id
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
const findGroupByName = async (payload) => {
    const existingGroup = await Group.findOne({
        where: { name: payload.name },
    })
    if (!existingGroup) {
        const error = new Error('group not found')
        error.statusCode = 404
        throw error
    }

    return existingGroup.dataValues
}
const findGroupByCategory = async (payload) => {
    const existingGroup = await Group.findOne(payload.name)
    if (!existingGroup) {
        const error = new Error('group not found')
        error.statusCode = 404
        throw error
    }

    return existingGroup.dataValues
}
const findAllGroupForCurrentUser = async (payload) => {
    const existingGroup = await Group.findAll({
        where: { admin_id: payload.user_id },
    })
    if (!existingGroup) {
        const error = new Error('group not found')
        error.statusCode = 404
        throw error
    }

    return existingGroup.dataValues
}

module.exports = {
    createGroup,
    deleteGroup,
    updateGroup,
    updateGroupAdmin,
    findGroupById,
    findGroupByName,
    findGroupByCategory,
    findAllGroupForCurrentUser,
}
