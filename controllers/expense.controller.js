const { errorHelper } = require('../helpers/commonResponse.helper')
// const groupService = require('../services/group.service')
const expenseService = require('../services/expense.service')

const addNonGroupExpense = async (req, res, next) => {
    try {
        const { body: payload } = req
        const data = await expenseService.addExpense(payload.value)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}
module.exports = {
    addNonGroupExpense,
}
