// services/currenciesService.js
const { Op } = require('sequelize')
const { FriendList } = require('../models')
const { User } = require('../models')
const { Transaction } = require('../models')

const addFriend = async (payload) => {
    const friendArray = [...payload.members]
    console.log('THIS IS FRIEND ARRAY ==> ', friendArray)
    const user_id = payload.user_id

    let friends = []
    await Promise.all(
        friendArray.map(async (friend_id, i) => {
            console.log('FRIEND FROM MAP ==> ', friend_id)
            const [existingUser, existingMapping] = await Promise.all([
                User.findByPk(friend_id),
                FriendList.findOne({
                    where: {
                        [Op.and]: [
                            { friend_id: friend_id },
                            { user_id: user_id },
                        ],
                    },
                }),
            ])
            if (!existingUser) {
                const error = new Error('user not found')
                error.statusCode = 404
                throw error
            }
            if (existingMapping) {
                const error = new Error('user already present in the group')
                error.statusCode = 409
                throw error
            }

            const member = await FriendList.create({ friend_id, user_id })
            friends.push({ [`member_${++i}`]: member.dataValues })
        })
    )
    if (friends.length > 0) {
        friends = await FriendList.findAll({
            where: {
                [Op.and]: [
                    { user_id: payload.user_id },
                    { friend_id: friendArray },
                ],
            },
            include: [
                {
                    model: User,
                    as: 'friend_details',
                    attributes: [
                        'first_name',
                        'email',
                        'mobile',
                        'id',
                        'status',
                    ],
                },
            ],
            attributes: ['id'],
        })
    }

    return friends
}

const removeFriend = async (payload) => {
    const isFriend = await FriendList.findOne({
        where: {
            [Op.or]: [
                {
                    [Op.or]: [
                        { user_id: payload.friend_id },
                        { friend_id: payload.user_id },
                    ],
                },
                {
                    [Op.or]: [
                        { user_id: payload.friend_id },
                        { friend_id: payload.friend_id },
                    ],
                },
            ],
        },
    })
    if (!isFriend) {
        const error = new Error('friend not found')
        error.statusCode = 404
        throw error
    }
    console.log(payload, 'FROM REMOVE FRIEND')
    const transactions = await Transaction.findAll({
        where: {
            [Op.and]: [
                {
                    [Op.or]: [
                        { payer_id: payload.friend_id },
                        { payee_id: payload.user_id },
                    ],
                },
                { settle_up_at: null },
            ],
        },
        attributes: ['id', 'amount', 'payer_id', 'payee_id'],
    })

    let totalPayeeAmount = 0
    let totalPayerAmount = 0
    if (transactions.length > 0) {
        transactions.forEach((transaction) => {
            const { amount, payee_id } = transaction.get({
                plain: true,
            })

            if (payee_id === payload.user_id) {
                totalPayeeAmount += Number(amount)
            } else {
                totalPayeeAmount += Number(amount)
            }
        })
    }

    const total_amount_owed =
        totalPayeeAmount.toFixed(2) - totalPayerAmount.toFixed(2)
    if (total_amount_owed > 0) {
        const error = new Error('pending transactions with friend')
        error.statusCode = 409
        throw error
    }
    const response = await FriendList.destroy({
        where: {
            [Op.and]: [
                { user_id: payload.user_id },
                { friend_id: payload.friend_id },
            ],
        },
    })

    return response
}

// const getAllPendingExpensesWithFriend = async (payload) => {
//     const transactions = await Transaction.findAll({
//         where: {
//             [Op.and]: [
//                 {
//                     [Op.or]: [
//                         { payer_id: payload.friend_id },
//                         { payee_id: payload.user_id },
//                     ],
//                     [Op.or]: [
//                         { payee_id: payload.friend_id },
//                         { payer_id: payload.user_id },
//                     ],
//                 },
//                 { settle_up_at: null },
//             ],
//         },
//         include: [
//             {
//                 model: User,
//                 as: 'payer_details',
//                 attributes: ['first_name', 'email', 'mobile'],
//             },
//             {
//                 model: User,
//                 as: 'payee_details',
//                 attributes: ['first_name', 'email', 'mobile'],
//             },
//             {
//                 model: Currency,
//                 as: 'currency_details',
//                 attributes: ['code'],
//             },
//             {
//                 model: Expense,
//                 as: 'expense_details',
//                 required: true,
//                 attributes: [
//                     'base_amount',
//                     'description',
//                     'category',
//                     'group_id',
//                     'id',
//                     'split_by',
//                 ],
//                 where: { group_id: { [Op.ne]: null } },
//             },
//         ],
//         attributes: ['id', 'amount', 'payer_id', 'payee_id'],
//     })

//     let totalPayeeAmountFriend = 0
//     let totalPayerAmountFriend = 0
//     let totalPayerAmountUser = 0
//     let totalPayeeAmountUser = 0

//     transactions.forEach((transaction) => {
//         const { amount, payer_id, payee_id } = transaction.get({ plain: true })
//         if (payer_id === payload.user_id) {
//             totalPayerAmountUser += Number(amount)
//         } else if (payer_id === payload.friend_id) {
//             totalPayerAmountFriend += Number(amount)
//         }
//     })

//     const total_amount_owed =
//         totalPayeeAmount.toFixed(2) - totalPayerAmount.toFixed(2)
//     error.data = {
//         total_Amount_User_Owned: Math.abs(totalPayeeAmount.toFixed(2)),
//         total_Amount_friend_Owed: Math.abs(totalPayerAmount.toFixed(2)),
//     }
// }

getCurrentUserFriend = async (user_id) => {
    friends = await FriendList.findAll({
        where: {
            [Op.or]: [{ user_id: user_id }, { friend_id: user_id }],
        },
        include: [
            {
                model: User,
                as: 'friend_details',
                attributes: ['first_name', 'email', 'mobile', 'id', 'status'],
            },
            {
                model: User,
                as: 'user_details',
                attributes: ['first_name', 'email', 'mobile', 'id', 'status'],
            },
        ],
        attributes: ['id'],
    })

    return friends
}
module.exports = {
    addFriend,
    removeFriend,
    getAllPendingExpensesWithFriend,
    getCurrentUserFriend,
}
