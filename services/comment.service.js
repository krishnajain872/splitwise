const { Comment } = require('../models')

const addComment = async (payload) => {
    let type
    if (!payload.user_id) {
        type = 'SPLITWISE'
    }
    const comment_payload = {
        type,
        expense_id: payload.expense_id,
        description: payload.description,
        user_id: payload.user_id,
    }
    const comment = await Comment.create(comment_payload)
    return comment
}
const getCommentByExpenseId = async (payload) => {
    const comment = await Comment.findAll({
        where: {
            expense_id: payload.expense_id,
        },
    })
    return comment
}
const getCommentByUserId = async (payload) => {
    const comment = await Comment.findAll({
        where: {
            expense_id: payload.expense_id,
        },
    })
    return comment
}
const getCommentById = async (payload) => {
    const comment = await Comment.findByPk(payload.id)
    return comment
}
const udpateComment = async (payload) => {
    const comment = await Comment.findByPk(payload.id)
    if (!comment) {
        const error = new Error('comment not found!')
        error.statusCode = 404
        throw error
    }
    if (
        payload.user_id !== comment.dataValues.user_id ||
        comment.dataValues.type === 'SPLITWISE'
    ) {
        const error = new Error('unauthorized access!')
        error.statusCode = 403
        throw error
    }
    await comment.update(
        {
            where: {
                id: payload.id,
            },
        },
        { description: payload.description }
    )
    comment.dataValues.description = payload.description
    return comment
}
module.exports = {
    addComment,
    getCommentByExpenseId,
    getCommentByUserId,
    getCommentById,
    udpateComment,
}
