const commentService = require('../services/comment.service')
const { errorHelper } = require('./../helpers/commonResponse.helper')
const addComment = async (req, res, next) => {
    try {
        const payload = {
            ...req.body.value,
            user_id: req.user.id,
            ...req.params.value,
        }
        const data = await commentService.addComment(payload)
        res.data = data
        res.data.added_by = {
            ...req.user,
        }
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}
const getCommentByExpenseId = async (req, res, next) => {
    try {
        let payload = { ...req.params.value }
        const data = await commentService.getCommentByExpenseId(payload)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}
const getCommentByUserId = async (req, res, next) => {
    try {
        let payload = {
            user_id: req.user.id,
            expense_id: req.params.value.expense_id,
        }
        const data = await commentService.getCommentByUserId(payload)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}
const udpateComment = async (req, res, next) => {
    try {
        let payload = {
            id: req.params.value.id,
            ...req.body.value,
            user_id: req.user.id,
        }
        const data = await commentService.udpateComment(payload)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}
const getCommentById = async (req, res, next) => {
    try {
        let payload = { id: req.params.value.id }
        const data = await commentService.getCommentById(payload)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}

module.exports = {
    addComment,
    getCommentByExpenseId,
    getCommentByUserId,
    getCommentById,
    udpateComment,
}
