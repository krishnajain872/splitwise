// services/currenciesService.js
const { Transaction } = require('../models')
const { Expense } = require('../models')

getAllTransactionByExpenseId = async (payload) => {
    const transaction = await Expense.findAll({
        where: { expense_id: payload },
        attributes: ['category', 'description', 'split_by', 'base_amount'],
        include: [
            {
                Model: Transaction,
                as: 'transaction',
                attributes: ['payer_id', 'payee_id', 'amount', 'currency_id'],
            },
        ],
    })
    return transaction
}
// settleUpTransaction = async (payload) => {
//     const transaction = await Expense.findAll({
//         where: { expense_id: payload },
//         attributes: ['category', 'description', 'split_by', 'base_amount'],
//         include: [
//             {
//                 Model: Transaction,
//                 as: 'transaction',
//                 attributes: ['payer_id', 'payee_id', 'amount', 'currency_id'],
//             },
//         ],
//     })
//     return transaction
// }
module.exports = {
    getAllTransactionByExpenseId,
}
