const { errorHelper } = require('../helpers/commonResponse.helper')
// const groupService = require('../services/group.service')
const expenseService = require('../services/expense.service')
const userService = require('../services/user.service')
const friendService = require('../services/friend.service')
const getAllUsers = async (req, res, next) => {
    try {
        const users = await userService.getAllUser()
        res.data = users
        next()
    } catch (error) {
        next(error)
    }
}

const addFriend = async (req, res, next) => {
    try {
        const members = req.body.value
        const user_id = req.user.id
        let newPayload = { ...members, user_id }
        const data = await friendService.addFriend(newPayload)
        res.data = data
        res.data.added_by = {
            ...req.user,
        }
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
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
const getCurrentUserFriend = async (req, res, next) => {
    try {
        const { id: user_id } = req.user
        const friend = await friendService.getCurrentUserFriend(user_id)
        res.data = friend
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
        const data = await expenseService.deleteExpense(expense_id.value)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}
const removeFriend = async (req, res, next) => {
    try {
        const { id: user_id } = req.user
        const friend_id = req.params.value
        const payload = { user_id, ...friend_id }
        const data = await friendService.removeFriend(payload)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}
const getAllPendingExpensesWithFriend = async (req, res, next) => {
    try {
        const { id: user_id } = req.user
        const friend_id = req.params.value
        const payload = { user_id, ...friend_id }
        const data =
            await friendService.getAllPendingExpensesWithFriend(payload)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}
const getAllPendingExpensesWithFriendAndSettleup = async (req, res, next) => {
    try {
        const { id: user_id } = req.user
        const friend_id = req.params.value
        const payload = { user_id, ...friend_id }
        const data =
            await friendService.getAllPendingExpensesWithFriendAndSettleup(
                payload
            )
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
const getAllPendingExpensesByCurrentUser = async (req, res, next) => {
    try {
        const { id: payload } = req.user
        const data = await expenseService.getAllPendingExpensesByUser(payload)
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
const getAllPendingNonGroupExpensesByCurrentUser = async (req, res, next) => {
    try {
        const { id: payload } = req.user
        const data =
            await expenseService.getAllPendingNonGroupExpensesByCurrentUser(
                payload
            )
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
    addFriend,
    removeFriend,
    getCurrentUserFriend,
    getAllPendingExpensesWithFriend,
    getAllPendingExpensesWithFriendAndSettleup,
    getAllPendingExpensesByCurrentUser,
    getAllPendingNonGroupExpensesByCurrentUser,
}
