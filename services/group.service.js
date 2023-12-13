const { User } = require('../models')
const { Group } = require('../models')
const { UserGroup } = require('../models')
const { Op } = require('sequelize')

const createGroup = async (payload) => {
    console.log('GROUP PAYLOAD ====>>> ', payload)
    const existingUser = await User.findByPk(payload.admin_id)
    if (!existingUser) {
        const error = new Error('user not found')
        error.statusCode = 404
        throw error
    }
    let addAdminInGroup
    const group = await Group.create(payload)
    console.log('GROUP CREATED ====>>> ', group)
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
    const { id: group_id, ...rest } = payload
    const existingGroup = await Group.findByPk(group_id)
    if (!existingGroup) {
        throw new Error('Group not found', { statusCode: 404 })
    }
    const updatedData = { ...existingGroup.dataValues, ...rest }
    const update = await Group.update(updatedData, { where: { id: group_id } })
    return update
}
// const updateGroupAdmin = async (payload) => {
//     const existingGroup = await Group.findByPk(payload.group_id)
//     if (!existingGroup) {
//         const error = new Error('group not found')
//         error.statusCode = 404
//         throw error
//     }
//     const existingUser = await User.findByPk(payload.user_id)
//     if (!existingUser) {
//         const error = new Error('user not found')
//         error.statusCode = 404
//         throw error
//     }

//     await Group.update(
//         { ...existingGroup, admin_id: payload.user_id },
//         {
//             where: {
//                 id: existingGroup.id,
//             },
//         }
//     )
//     existingGroup.admin_id = payload.user_id
//     return existingGroup
// }

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
        where: { admin_id: payload },
    })
    return existingGroup
}
const addMember = async (payload) => {
    console.log(' addMember GROUP PAYLOAD ====>>> ', payload)
    const group_id = payload.id
    let addedGroupMembers = {}

    const existingGroup = await Group.findByPk(group_id)
    if (!existingGroup) {
        const error = new Error('group not found')
        error.statusCode = 404
        throw error
    }
    const userArray = payload.member
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
            addedGroupMembers[`member_${++i}`] = member.dataValues
        })
    )

    console.log('ADDED MEMBER   ===>>  ', addedGroupMembers)
    return addedGroupMembers
}

module.exports = {
    createGroup,
    deleteGroup,
    updateGroup,
    // updateGroupAdmin,
    findGroupById,
    findGroupByName,
    findGroupByCategory,
    findAllGroupForCurrentUser,
    addMember,
}
