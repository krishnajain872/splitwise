// services/currenciesService.js
const { Op } = require('sequelize')
const { FriendList, sequelize } = require('../models')
const { User } = require('../models')
const { Transaction } = require('../models')
const { Currency } = require('../models')
const { Expense } = require('../models')

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
                const error = new Error(
                    'user already present in the friend list'
                )
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
                { user_id: payload.user_id, friend_id: payload.friend_id },
                { user_id: payload.friend_id, friend_id: payload.user_id },
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
                        {
                            payer_id: payload.user_id,
                            payee_id: payload.friend_id,
                        },
                        {
                            payer_id: payload.friend_id,
                            payee_id: payload.user_id,
                        },
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
        console.log(total_amount_owed, 'FROM REMOVE FRIEND WHEN PENDING DEBTS')
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

const getAllPendingExpensesWithFriend = async (payload) => {
    const isFriend = await FriendList.findOne({
        where: {
            [Op.or]: [
                { user_id: payload.user_id, friend_id: payload.friend_id },
                { user_id: payload.friend_id, friend_id: payload.user_id },
            ],
        },
        include: [
            {
                model: User,
                as: 'user_details',
                attributes: ['id', 'first_name', 'email', 'mobile'],
            },
            {
                model: User,
                as: 'friend_details',
                attributes: ['id', 'first_name', 'email', 'mobile'],
            },
        ],
    })

    if (!isFriend) {
        const error = new Error('friend not found')
        error.statusCode = 404
        throw error
    }

    const transactions = await Transaction.findAll({
        where: {
            [Op.and]: [
                {
                    [Op.or]: [
                        {
                            payer_id: payload.user_id,
                            payee_id: payload.friend_id,
                        },
                        {
                            payer_id: payload.friend_id,
                            payee_id: payload.user_id,
                        },
                    ],
                },
                { settle_up_at: null },
            ],
        },

        include: [
            {
                model: User,
                as: 'payer_details',
                attributes: ['first_name', 'email', 'mobile'],
            },
            {
                model: User,
                as: 'payee_details',
                attributes: ['first_name', 'email', 'mobile'],
            },
            {
                model: Currency,
                as: 'currency_details',
                attributes: ['code'],
            },
            {
                model: Expense,
                as: 'expense_details',
                required: true,
                attributes: [
                    'base_amount',
                    'description',
                    'category',
                    'group_id',
                    'id',
                    'split_by',
                ],
            },
        ],
        attributes: ['id', 'amount', 'payer_id', 'payee_id'],
    })
    let totalAmountFriendBrrowed = 0
    let totalAmountUserBrrowed = 0

    let friend = {
        ...isFriend.friend_details.dataValues,
    }
    let user = { ...isFriend.user_details.dataValues }

    transactions.forEach((transaction) => {
        const { amount, payee_id, payer_id } = transaction.get({
            plain: true,
        })
        if (payer_id === payload.friend_id && payee_id === payload.user_id) {
            totalAmountFriendBrrowed += Number(amount)
        } else if (
            payee_id === payload.friend_id &&
            payer_id === payload.user_id
        ) {
            totalAmountUserBrrowed += Number(amount)
        }
    })

    const total_amount_borrowed =
        totalAmountUserBrrowed.toFixed(2) - totalAmountFriendBrrowed.toFixed(2)
    let response
    if (total_amount_borrowed <= 0) {
        response = {
            total_Amount_friend_borrowed: Math.abs(total_amount_borrowed),
            friend,
            message: `your friend borrowed ${Math.abs(
                total_amount_borrowed
            )} amount from you`,
        }
    } else {
        response = {
            total_Amount_User_borrowed: Math.abs(total_amount_borrowed),
            user,
            message: `you borrowed ${Math.abs(
                total_amount_borrowed
            )} amount from ${friend.first_name}`,
        }
    }
    return response
}

const getAllPendingExpensesWithFriendAndSettleup = async (payload) => {
    const t = await sequelize.transaction()
    try {
        const isFriend = await FriendList.findOne({
            where: {
                [Op.or]: [
                    { user_id: payload.user_id, friend_id: payload.friend_id },
                    { user_id: payload.friend_id, friend_id: payload.user_id },
                ],
            },
            include: [
                {
                    model: User,
                    as: 'user_details',
                    attributes: ['id', 'first_name', 'email', 'mobile'],
                },
                {
                    model: User,
                    as: 'friend_details',
                    attributes: ['id', 'first_name', 'email', 'mobile'],
                },
            ],
        })

        if (!isFriend) {
            const error = new Error('friend not found')
            error.statusCode = 404
            throw error
        }

        const transactions = await Transaction.findAll(
            {
                where: {
                    [Op.and]: [
                        {
                            [Op.or]: [
                                {
                                    payer_id: payload.user_id,
                                    payee_id: payload.friend_id,
                                },
                                {
                                    payer_id: payload.friend_id,
                                    payee_id: payload.user_id,
                                },
                            ],
                        },
                        { settle_up_at: null },
                    ],
                },

                include: [
                    {
                        model: User,
                        as: 'payer_details',
                        attributes: ['first_name', 'email', 'mobile'],
                    },
                    {
                        model: User,
                        as: 'payee_details',
                        attributes: ['first_name', 'email', 'mobile'],
                    },
                    {
                        model: Currency,
                        as: 'currency_details',
                        attributes: ['code'],
                    },
                    {
                        model: Expense,
                        as: 'expense_details',
                        required: true,
                        attributes: [
                            'base_amount',
                            'description',
                            'category',
                            'group_id',
                            'id',
                            'split_by',
                        ],
                    },
                ],
                attributes: ['id', 'amount', 'payer_id', 'payee_id'],
            },
            { transaction: t }
        )
        let totalAmountFriendBrrowed = 0
        let totalAmountUserBrrowed = 0

        let friend = {
            ...isFriend.friend_details.dataValues,
        }
        let user = { ...isFriend.user_details.dataValues }

        const settle_up_transactions = []

        for (const transaction of transactions) {
            const { amount, payee_id, payer_id } = transaction.get({
                plain: true,
            })
            if (
                payer_id === payload.friend_id &&
                payee_id === payload.user_id
            ) {
                totalAmountFriendBrrowed += Number(amount)
            } else if (
                payee_id === payload.friend_id &&
                payer_id === payload.user_id
            ) {
                totalAmountUserBrrowed += Number(amount)
            }
            const date = new Date()
            const updateCount = await Transaction.update(
                {
                    settle_up_at: date,
                },
                {
                    where: {
                        id: transaction.dataValues.id,
                    },
                }
            )
            const transaction_data = {
                expense_details: { ...transaction.expense_details.dataValues },
                settle_up_at: date,
                transaction_id: transaction.id,
                payer_details: { ...transaction.payer_details.dataValues },
                payee_details: { ...transaction.payee_details.dataValues },
            }
            if (updateCount) settle_up_transactions.push(transaction_data)
        }

        const total_amount_borrowed =
            totalAmountUserBrrowed.toFixed(2) -
            totalAmountFriendBrrowed.toFixed(2)
        let response
        if (total_amount_borrowed <= 0) {
            response = {
                total_Amount_friend_borrowed: Math.abs(total_amount_borrowed),
                friend,
                message: ` your friend borrowed ${Math.abs(
                    total_amount_borrowed
                )} amount from you All transactions between user and friend is settled successfully`,
            }
        } else {
            response = {
                total_Amount_User_borrowed: Math.abs(total_amount_borrowed),
                user,
                message: `you borrowed ${Math.abs(
                    total_amount_borrowed
                )} amount from ${
                    friend.first_name
                } All transactions between user and friend is settled successfully`,
            }
        }
        response.settled_up_transactions = settle_up_transactions
        await t.commit()
        return response
    } catch (error) {
        await t.rollback()
        throw error
    }
}

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
    getAllPendingExpensesWithFriendAndSettleup,
}
