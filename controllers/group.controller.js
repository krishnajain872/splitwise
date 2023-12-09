const { errorHelper } = require('../helpers/commonResponse.helper')
const groupService = require('../services/group.service')

const createGroup = async (req, res, next) => {
    try {
        const { body: payload } = req
        let { user_id, ...rest } = payload.value
        let newPayload = { ...rest, admin_id: user_id }
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
        const { params: payload } = req
        const data = await groupService.findAllGroupForCurrentUser(payload)
        res.data = data
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
}
