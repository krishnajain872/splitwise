const { errorHelper } = require('../helpers/commonResponse.helper')
const groupService = require('../services/group.service')
const expenseService = require('../services/expense.service')

const createGroup = async (req, res, next) => {
    try {
        const { body: payload } = req
        const { id: user_id } = req.user
        const newPayload = {
            admin_id: user_id,
            ...payload.value,
        }
        console.log('THIS IS CONTROLLER ===>>> ', newPayload)
        const data = await groupService.createGroup(newPayload)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}

const deleteGroup = async (req, res, next) => {
    try {
        const { params: payload } = req
        const data = await groupService.deleteGroup(payload.value)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}
const updateGroup = async (req, res, next) => {
    try {
        const { body: payload } = req
        const data = await groupService.updateGroup(payload.value)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}
const updateExpense = async (req, res, next) => {
    try {
        const { body: payload } = req
        console.log('Payload for ==> ', payload)
        const data = await expenseService.updateExpense(payload)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}
const addExpense = async (req, res, next) => {
    try {
        const { body: payload } = req

        console.log('PAYLOAD FOR ADD EXPENSE ====>>', payload)
        const data = await expenseService.addExpense(payload)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}
const updateGroupAdmin = async (req, res, next) => {
    try {
        const { body: payload } = req
        const data = await groupService.updateGroupAdmin(payload.value)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}
const findGroupById = async (req, res, next) => {
    try {
        const { params: payload } = req
        const data = await groupService.deleteGroup(payload)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}
const findGroupByName = async (req, res, next) => {
    try {
        const { params: payload } = req
        const data = await groupService.findGroupByName(payload)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}
const findGroupByCategory = async (req, res, next) => {
    try {
        const { params: payload } = req
        const data = await groupService.findGroupByCategory(payload)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}
const findAllGroupForCurrentUser = async (req, res, next) => {
    try {
        const { id: payload } = req.user
        const data = await groupService.findAllGroupForCurrentUser(payload)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}
const findAllMemberForCurrentUser = async (req, res, next) => {
    try {
        const { id: payload } = req.params
        const data = await groupService.findAllMemberOfCurrentGroup(payload)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}

const addMember = async (req, res, next) => {
    try {
        const { body: payload } = req
        let { user_id, ...rest } = payload.value
        let newPayload = { ...rest }
        const data = await groupService.addMember(newPayload)
        res.data = data
        res.data.added_by = user_id
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}
// const removeMember = async (req, res, next) => {
//     try {
//         const { id: group_id, user_id } = req.params
//         const data = await groupService.removeMember(payload.value)
//         res.data = data
//         next()
//     } catch (error) {
//         errorHelper(req, res, error.message, error.statusCode, error)
//     }
// }

module.exports = {
    createGroup,
    deleteGroup,
    updateGroup,
    updateGroupAdmin,
    findGroupById,
    findGroupByName,
    findGroupByCategory,
    findAllGroupForCurrentUser,
    addMember,
    updateExpense,
    addExpense,
    findAllMemberForCurrentUser,

    // removeMember,
}
