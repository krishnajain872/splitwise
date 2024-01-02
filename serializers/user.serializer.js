const { dateHelper } = require('../helpers/date.helper')
const getAllUser = async (_, res, next) => {
    let recievedData = res.data || {}
    let resultData = []
    if (recievedData) {
        recievedData.map((user) => {
            resultData.push({
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                mobile: user.mobile,
                status: user.status,
                email: user.email,
            })
        })
    }
    res.data = resultData
    next()
}
const getAllCurrencies = async (_, res, next) => {
    let recievedData = res.data || []
    let resultData = []
    if (recievedData) {
        recievedData.map((currency) => {
            resultData.push({
                id: currency.id,
                code: currency.code,
                name: currency.name,
                exchangeRate: currency.exchange_rate,
            })
        })
    }
    res.data = resultData
    next()
}
const getLoginUser = async (_, res, next) => {
    let recievedData = res.data || {}
    let resultData = []
    if (recievedData) {
        resultData = {
            id: recievedData.id,
            firstName: recievedData.first_name,
            lastName: recievedData.last_name,
            mobile: recievedData.mobile,
            status: recievedData.status,
            email: recievedData.email,
        }
    }
    res.data = resultData
    next()
}
const settleUpTransaction = async (_, res, next) => {
    let recievedData = res.data || {}
    let resultData = {}
    if (recievedData) {
        resultData.expense = {
            id: recievedData.expense_details.id,
            baseAmount: recievedData.expense_details.base_amount,
            splitBy: recievedData.expense_details.split_by,
            description: recievedData.expense_details.description,
            groupId: recievedData.expense_details.group_id,
            createdAt: dateHelper(recievedData.created_at),
            currency: recievedData.currency_details.code,
            transaction: {
                id: recievedData.id,
                amount: recievedData.amount,
                settleUpAt: dateHelper(recievedData.settle_up_at),
                payer: {
                    id: recievedData.payer_details.id,
                    firstName: recievedData.payer_details.first_name,
                    mobile: recievedData.payer_details.mobile,
                    email: recievedData.payer_details.email,
                    status: recievedData.payer_details.status,
                },
                payee: {
                    id: recievedData.payee_details.id,
                    firstName: recievedData.payee_details.first_name,
                    mobile: recievedData.payee_details.mobile,
                    email: recievedData.payee_details.email,
                    status: recievedData.payer_details.status,
                },
            },
        }
    }
    res.data = resultData
    next()
}
const expense = async (_, res, next) => {
    let recievedData = res.data || {}
    let resultData = {}
    let transactions = []
    let payees = []
    if (recievedData) {
        resultData.expense = {
            id: recievedData.id,
            baseAmount: recievedData.base_amount,
            splitBy: recievedData.split_by,
            category: recievedData.category,
            description: recievedData.description,
            groupId: recievedData.group_id,
            currency: recievedData.expense_currency,
            createdAt: dateHelper(recievedData.created_at),
        }
        recievedData.payees.map((payee) => {
            payees.push({
                id: payee.user_details.id,
                firstName: payee.user_details.first_name,
                mobile: payee.user_details.mobile,
                email: payee.user_details.email,
                amount: payee.amount,
            })
        })
        resultData.payees = payees
        recievedData.transaction.map((transaction) => {
            transactions.push({
                id: transaction.id,
                amount: transaction.amount,
                settleUpAt: dateHelper(transaction.settle_up_at),

                payer: {
                    id: transaction.payer_details.id,
                    firstName: transaction.payer_details.first_name,
                    mobile: transaction.payer_details.mobile,
                    email: transaction.payer_details.email,
                },
                payee: {
                    id: transaction.payee_details.id,
                    firstName: transaction.payee_details.first_name,
                    mobile: transaction.payee_details.mobile,
                    email: transaction.payee_details.email,
                },
            })
        })
        resultData.transactions = transactions
    }
    res.data = resultData
    next()
}
const getAllTransactionofAnExpense = async (_, res, next) => {
    let recievedData = res.data || {}
    let resultData = {}
    let transactions = []
    if (recievedData) {
        resultData.expense = {
            id: recievedData.id,
            baseAmount: recievedData.base_amount,
            splitBy: recievedData.split_by,
            category: recievedData.category,
            description: recievedData.description,
            groupId: recievedData.group_id,
            currency: recievedData.expense_currency,
            createdAt: dateHelper(recievedData.created_at),
        }
        recievedData.transaction.map((transaction) => {
            transactions.push({
                id: transaction.id,
                amount: transaction.amount,
                settleUpAt: dateHelper(transaction.settle_up_at),

                payer: {
                    id: transaction.payer_details.id,
                    firstName: transaction.payer_details.first_name,
                    mobile: transaction.payer_details.mobile,
                    email: transaction.payer_details.email,
                },
                payee: {
                    id: transaction.payee_details.id,
                    firstName: transaction.payee_details.first_name,
                    mobile: transaction.payee_details.mobile,
                    email: transaction.payee_details.email,
                },
            })
        })
        resultData.transactions = transactions
    }
    res.data = resultData
    next()
}
const getTotalAmountOwedByCurrentUser = async (_, res, next) => {
    let recievedData = res.data || {}
    let resultData = {}
    let transactions = []
    if (recievedData) {
        recievedData.transactions.map((transaction) => {
            transactions.push({
                id: transaction.id,
                amount: transaction.amount,
                settleUpAt: dateHelper(transaction.settle_up_at),
                payer: {
                    id: transaction.payer_details.id,
                    firstName: transaction.payer_details.first_name,
                    mobile: transaction.payer_details.mobile,
                    email: transaction.payer_details.email,
                },
                payee: {
                    id: transaction.payee_details.id,
                    firstName: transaction.payee_details.first_name,
                    mobile: transaction.payee_details.mobile,
                    email: transaction.payee_details.email,
                },
            })
        })
        resultData.transactions = transactions
        resultData.totalAmountOwedByCurrentUser = recievedData.total_amount_owed

        resultData.transactions = transactions
        if (resultData.totalAmountOwedByCurrentUser < 0) {
            resultData.totalAmountOwedByCurrentUser = parseFloat(
                recievedData.total_amount_owed
            ).toFixed(2)
            resultData.message = 'you are in debt'
        } else {
            resultData.totalAmountOwedByCurrentUser = parseFloat(
                recievedData.total_amount_owed
            ).toFixed(2)
            resultData.message = 'you are owed money'
        }
    }
    res.data = resultData
    next()
}
const getAllExpensesOfUsers = async (_, res, next) => {
    let recievedData = res.data || {}
    let resultData = {}
    let totalExpenses
    if (recievedData) {
        recievedData.map((expense, i) => {
            let transactions = []
            let payees = []
            resultData[`expense${++i}`] = {
                id: expense.id,
                baseAmount: expense.base_amount,
                splitBy: expense.split_by,
                category: expense.category,
                description: expense.description,
                groupId: expense.group_id,
                currency: expense.expense_currency,
                createdAt: dateHelper(expense.created_at),
            }
            expense.payees.map((payee) => {
                payees.push({
                    id: payee.user_details.id,
                    firstName: payee.user_details.first_name,
                    mobile: payee.user_details.mobile,
                    email: payee.user_details.email,
                    amount: payee.amount,
                })
            })
            resultData[`expense${i}`].payees = payees
            expense.transaction.map((transaction) => {
                transactions.push({
                    id: transaction.id,
                    amount: transaction.amount,
                    settleUpAt: dateHelper(transaction.settle_up_at),

                    payer: {
                        id: transaction.payer_details.id,
                        firstName: transaction.payer_details.first_name,
                        mobile: transaction.payer_details.mobile,
                        email: transaction.payer_details.email,
                    },
                    payee: {
                        id: transaction.payee_details.id,
                        firstName: transaction.payee_details.first_name,
                        mobile: transaction.payee_details.mobile,
                        email: transaction.payee_details.email,
                    },
                })
            })
            resultData[`expense${i}`].transactions = transactions
            totalExpenses = i
        })
        resultData['totalExpenseCount'] = totalExpenses
    }
    res.data = resultData
    next()
}
const getAllPendingExpensesOfUsers = async (_, res, next) => {
    let recievedData = res.data || {}
    let resultData = {}
    let totalExpenses
    if (recievedData) {
        recievedData.map((expense, i) => {
            let transactions = []
            let payees = []
            resultData[`expense${++i}`] = {
                id: expense.id,
                baseAmount: expense.base_amount,
                splitBy: expense.split_by,
                category: expense.category,
                description: expense.description,
                groupId: expense.group_id,
                currency: expense.expense_currency,
                createdAt: dateHelper(expense.created_at),
            }
            expense.payees.map((payee) => {
                payees.push({
                    id: payee.user_details.id,
                    firstName: payee.user_details.first_name,
                    mobile: payee.user_details.mobile,
                    email: payee.user_details.email,
                    amount: payee.amount,
                })
            })
            resultData[`expense${i}`].payees = payees
            expense.transaction.map((transaction) => {
                transactions.push({
                    id: transaction.id,
                    amount: transaction.amount,
                    settleUpAt: dateHelper(transaction.settle_up_at),

                    payer: {
                        id: transaction.payer_details.id,
                        firstName: transaction.payer_details.first_name,
                        mobile: transaction.payer_details.mobile,
                        email: transaction.payer_details.email,
                    },
                    payee: {
                        id: transaction.payee_details.id,
                        firstName: transaction.payee_details.first_name,
                        mobile: transaction.payee_details.mobile,
                        email: transaction.payee_details.email,
                    },
                })
            })
            resultData[`expense${i}`].transactions = transactions
            totalExpenses = i
        })
        resultData['totalExpenseCount'] = totalExpenses
    }
    res.data = resultData
    next()
}
const getAllFriends = async (_, res, next) => {
    let recievedData = res.data || {}
    let resultData = []
    if (recievedData) {
        recievedData.map((data) => {
            resultData.push({
                id: data.id,
                friendOne: {
                    id: data.friend_details.id,
                    firstName: data.friend_details.first_name,
                    mobile: data.friend_details.mobile,
                    status: data.friend_details.status,
                    email: data.friend_details.email,
                },
                friendTwo: {
                    id: data.user_details.id,
                    firstName: data.user_details.first_name,
                    mobile: data.user_details.mobile,
                    status: data.user_details.status,
                    email: data.user_details.email,
                },
            })
        })
    }
    res.data = resultData
    next()
}
const totalAmountOwedWithFriend = async (_, res, next) => {
    let recievedData = res.data || {}
    let resultData = {}
    if (recievedData) {
        if (recievedData.totalAmountUserBorrowed) {
            resultData.totalAmountUserBorrowed =
                recievedData.totalAmountUserBorrowed
            resultData.user = {
                id: recievedData.user.id,
                firstName: recievedData.user.first_name,
                email: recievedData.user.email,
                mobile: recievedData.user.mobile,
            }
            resultData.message = recievedData.message
        } else {
            resultData.totalAmountFriendBorrowed =
                recievedData.totalAmountFriendBorrowed
            resultData.friend = {
                id: recievedData.friend.id,
                firstName: recievedData.friend.first_name,
                email: recievedData.friend.email,
                mobile: recievedData.friend.mobile,
            }
            resultData.message = recievedData.message
        }
    }
    res.data = resultData
    next()
}
const settletotalAmountAndAllExpensesOwedWithFriend = async (_, res, next) => {
    let recievedData = res.data || {}
    let resultData = {}
    let settledUpTransactions = []
    if (recievedData) {
        if (recievedData.totalAmountUserBorrowed) {
            resultData.totalAmountUserBorrowed =
                recievedData.totalAmountUserBorrowed
            resultData.user = {
                id: recievedData.user.id,
                firstName: recievedData.user.first_name,
                email: recievedData.user.email,
                mobile: recievedData.user.mobile,
            }
            resultData.message = recievedData.message
        } else {
            resultData.totalAmountFriendBorrowed =
                recievedData.totalAmountFriendBorrowed
            resultData.friend = {
                id: recievedData.friend.id,
                firstName: recievedData.friend.first_name,
                email: recievedData.friend.email,
                mobile: recievedData.friend.mobile,
            }
            resultData.message = recievedData.message
        }

        recievedData.settled_up_transactions.map((data) => {
            settledUpTransactions.push({
                expense: {
                    id: data.expense_details.id,
                    baseAmount: data.expense_details.base_amount,
                    splitBy: data.expense_details.split_by,
                    category: data.expense_details.category,
                    description: data.expense_details.description,
                    groupId: data.expense_details.group_id,
                    currency: data.expense_details.expense_currency,
                },
                transaction: {
                    id: data.transaction_id.id,
                    amount: data.amount,
                    settleUpAt: dateHelper(data.settle_up_at),

                    payer: {
                        id: data.payer_details.id,
                        firstName: data.payer_details.first_name,
                        mobile: data.payer_details.mobile,
                        email: data.payer_details.email,
                    },
                    payee: {
                        id: data.payee_details.id,
                        firstName: data.payee_details.first_name,
                        mobile: data.payee_details.mobile,
                        email: data.payee_details.email,
                    },
                },
            })
        })
        resultData.settledUpTransactions = settledUpTransactions
    }
    res.data = resultData
    next()
}
const addFriend = async (_, res, next) => {
    let recievedData = res.data || {}
    let resultData = []
    if (recievedData) {
        recievedData.map((data) => {
            resultData.push({
                id: data.id,
                friend: {
                    id: data.friend_details.id,
                    firstName: data.friend_details.first_name,
                    mobile: data.friend_details.mobile,
                    status: data.friend_details.status,
                    email: data.friend_details.email,
                },
            })
        })
    }
    res.data = resultData
    next()
}
module.exports = {
    getAllUser,
    getLoginUser,
    getAllCurrencies,
    expense,
    getTotalAmountOwedByCurrentUser,
    getAllTransactionofAnExpense,
    getAllExpensesOfUsers,
    getAllPendingExpensesOfUsers,
    settleUpTransaction,
    getAllFriends,
    totalAmountOwedWithFriend,
    settletotalAmountAndAllExpensesOwedWithFriend,
    addFriend,
}
