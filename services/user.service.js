// services/currenciesService.js
// const { Transaction } = require('../models')
// const { Expense } = require('../models')
const { User } = require('../models')

getAllUser = async () => {
    const users = await User.findAll({
        attributes: [
            'first_name',
            'last_name',
            'mobile',
            'email',
            'id',
            'status',
        ],
    })
    return users
}

getUserById = async (payload) => {
    console.log('FIND CURRENT USER SERVICE PAYLAOD ===> ', payload)
    const user = await User.findByPk(payload, {
        attributes: [
            'first_name',
            'last_name',
            'mobile',
            'email',
            'id',
            'status',
        ],
    })
    if (!user) {
        const error = new Error('user not found!')
        error.statusCode = 404
        throw error
    }
    return user
}

module.exports = {
    getAllUser,
    getUserById,
}
