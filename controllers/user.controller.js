const { errorHelper } = require('../helpers/commonResponse.helper')
// const groupService = require('../services/group.service')
const expenseService = require('../services/expense.service')
const userService = require('../services/user.service')
const getAllUsers = async (req, res, next) => {
    try {
        const users = await userService.getAllUser()
        res.data = users
        next()
    } catch (error) {
        next(error)
    }
}
const getCurrentUser = async (req, res, next) => {
    try {
        const { id: payload } = req.user
        const user = await userService.getUserById(payload)
        res.data = user
        next()
    } catch (error) {
        next(error)
    }
}

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
const updateNonGroupExpense = async (req, res, next) => {
    try {
        const { body: payload_data } = req
        const { expense_id } = req.params.value
        const payload = { ...payload_data.value, expense_id }
        console.log('THIS IS UPATE EXPENSE CONTROLLER ===> ', payload_data)
        const data = await expenseService.updateExpense(payload)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}
const deleteNonGroupExpense = async (req, res, next) => {
    try {
        const expense_id = req.params
        console.log('THIS IS DELETE  EXPENSE CONTROLLER', expense_id)
        const data = await expenseService.deleteExpense(expense_id.value)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}
const getAllExpensesByCurrentUser = async (req, res, next) => {
    try {
        const { id: payload } = req.user
        const data = await expenseService.getAllExpensesByUser(payload)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}
const getAllNonGroupExpensesByCurrentUser = async (req, res, next) => {
    try {
        const { id: payload } = req.user
        const data =
            await expenseService.getAllNonGroupExpensesByCurrentUser(payload)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}
const getTotalAmountOwedByCurrentUser = async (req, res, next) => {
    try {
        const { id: user_id } = req.user
        const payload = {
            user_id,
        }
        const data =
            await expenseService.getTotalAmountOwedByCurrentUser(payload)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}

module.exports = {
    addNonGroupExpense,
    getAllExpensesByCurrentUser,
    getAllNonGroupExpensesByCurrentUser,
    getAllUsers,
    updateNonGroupExpense,
    deleteNonGroupExpense,
    getCurrentUser,
    getTotalAmountOwedByCurrentUser,
}
