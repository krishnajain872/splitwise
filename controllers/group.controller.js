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
        const { id: group_id } = req.params.value
        payload.value.group_id = group_id
        console.log('Payload for ==> ', payload)
        const data = await expenseService.updateExpense(payload.value)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}
const deleteExpense = async (req, res, next) => {
    try {
        const { expense_id: payload } = req.params.value
        console.log('Payload for ==> ', payload)
        const data = await expenseService.deleteExpense(payload)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}
const addExpense = async (req, res, next) => {
    try {
        const { body: payload } = req
        const { id: group_id } = req.params.value
        console.log('PAYLOAD FOR ADD EXPENSE ====>>', req.params)
        payload.value.group_id = group_id
        const data = await expenseService.addExpense(payload.value)
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
        const { id: payload } = req.params.value
        const data = await groupService.findAllMemberOfCurrentGroup(payload)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}

const addMember = async (req, res, next) => {
    try {
        const member = req.body.value
        const user_id = req.user.id
        const { id: group_id } = req.params.value
        let newPayload = { group_id, ...member }
        const data = await groupService.addMember(newPayload)
        res.data = data
        res.data.added_by = user_id
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}
const removeMember = async (req, res, next) => {
    try {
        const payload = req.params.value
        const removedBy = req.user
        const data = await groupService.removeMember(payload)
        res.data = data
        res.data.removed_by = { ...removedBy }
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
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
    addMember,
    updateExpense,
    addExpense,
    findAllMemberForCurrentUser,
    deleteExpense,
    removeMember,
}
