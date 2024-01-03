const { Comment } = require('../models')
const { dateHelper } = require('../helpers/date.helper')
const { errorHelper } = require('../helpers/commonResponse.helper')

const addSystemComments = async (req, res, next) => {
    try {
        const { id: mobile, first_name } = req.user
        const { id } = req.expense
        const date = new Date()
        let type
        if (req.method === 'PUT' || req.method === 'PATCH') {
            type = 'updated'
        } else if (req.method === 'DELETED') {
            type = 'deleted'
        } else {
            type = ''
        }
        const description = `expense ${type} at ${dateHelper(
            date
        )} by user ${first_name} with mobile ${mobile}`
        const comment_payload = {
            type: 'SYSTEM',
            expense_id: id,
            description,
        }
        await Comment.create(comment_payload)
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}

module.exports = {
    addSystemComments,
}
