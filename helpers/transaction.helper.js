// function calculateTransactions(expense, payees) {
//     const baseAmountPerPerson = parseFloat((expense / payees.length).toFixed(2))
//     let transactions = []
//     let transactionData = {}

//     let updatedPayees = payees.map((payee) => {
//         let balance = parseFloat(
//             (Number(payee.amount) - baseAmountPerPerson).toFixed(2)
//         )
//         transactionData['expense_id'] = payee.expense_id
//         transactionData['currency_id'] = payee.currency_id
//         return { ...payee, balance }
//     })

//     updatedPayees.sort((a, b) => a.balance - b.balance)

//     let payerIndex = 0
//     let payeeIndex = updatedPayees.length - 1

//     while (payerIndex < payeeIndex) {
//         let payer = updatedPayees[payerIndex]
//         let payee = updatedPayees[payeeIndex]
//         let amount = parseFloat(
//             Math.min(-payer.balance, payee.balance).toFixed(2)
//         )

//         transactions.push({
//             payer_id: payer.user_id,
//             payee_id: payee.user_id,
//             amount: amount === 0 ? Math.abs(amount) : amount,
//             ...transactionData,
//         })

//         payer.balance += amount
//         payee.balance -= amount

//         if (payer.balance === 0) payerIndex++
//         if (payee.balance === 0) payeeIndex--
//     }
//     return transactions
// }

// // function calculateTransactionsByShare(expense, payees) {
//     let transactions = []
//     let transactionData = {}

//     let updatedPayees = payees.map((payee) => {
//         let balance = parseFloat(
//             (Number(payee.amount) - Number(payee.share)).toFixed(2)
//         )
//         transactionData['expense_id'] = payee.expense_id
//         transactionData['currency_id'] = payee.currency_id
//         return { ...payee, balance }
//     })

//     updatedPayees.sort((a, b) => a.balance - b.balance)

//     let payerIndex = 0
//     let payeeIndex = updatedPayees.length - 1

//     while (payerIndex < payeeIndex) {
//         let payer = updatedPayees[payerIndex]
//         let payee = updatedPayees[payeeIndex]
//         let amount = parseFloat(
//             Math.min(-payer.balance, payee.balance).toFixed(2)
//         )

//         transactions.push({
//             payer_id: payer.user_id,
//             payee_id: payee.user_id,
//             amount: amount === 0 ? Math.abs(amount) : amount,
//             ...transactionData,
//         })

//         payer.balance += amount
//         payee.balance -= amount

//         if (payer.balance === 0) payerIndex++
//         if (payee.balance === 0) payeeIndex--
//     }
//     return transactions
// }

// module.exports = {
//     calculateTransactions,
//     // calculateTransactionsByShare,
// }

// function calculateTransactions(expense, payees) {
//     let transactions = []

//     let updatedPayees = payees.map((payee) => {
//         let share = payee.share
//             ? (expense * Number(payee.share)) / 100
//             : expense / payees.length
//         let balance = Number(payee.amount) - share
//         return { ...payee, balance }
//     })

//     updatedPayees.sort((a, b) => a.balance - b.balance)

//     let payerIndex = 0
//     let payeeIndex = updatedPayees.length - 1

//     while (payerIndex < payeeIndex) {
//         let payer = updatedPayees[payerIndex]
//         let payee = updatedPayees[payeeIndex]
//         let amount = Math.min(-payer.balance, payee.balance)

//         if (amount > 0) {
//             transactions.push({
//                 payer_id: payer.user_id,
//                 payee_id: payee.user_id,
//                 amount: amount,
//                 expense_id: payer.expense_id,
//                 currency_id: payer.currency_id,
//             })
//         }

//         payer.balance += amount
//         payee.balance -= amount

//         if (payer.balance >= 0) payerIndex++
//         if (payee.balance <= 0) payeeIndex--
//     }

//     return transactions
// }
function calculateTransactions(expense, payees) {
    let transactions = []

    let updatedPayees = payees.map((payee) => {
        let share = Number(payee.share)
        let amount = Number(payee.amount)
        let calculatedShare = !(share === null || share === undefined)
            ? share
            : expense / payees.length
        let balance = amount - calculatedShare
        balance = Number(balance.toFixed(2))
        return { ...payee, balance }
    })

    console.log(
        'THIS IS UPDATED PAYESS FROM TRANSACTION CALCULATION ==>> \n',
        updatedPayees
    )

    updatedPayees.sort((a, b) => a.balance - b.balance)

    let payerIndex = 0
    let payeeIndex = updatedPayees.length - 1

    while (payerIndex < payeeIndex) {
        let payer = updatedPayees[payerIndex]
        let payee = updatedPayees[payeeIndex]
        let amount = Math.min(-payer.balance, payee.balance)

        let { user_id: payer_id, expense_id, currency_id } = payer
        transactions.push({
            payer_id,
            payee_id: payee.user_id,
            amount,
            expense_id,
            currency_id,
        })

        payer.balance += amount
        payee.balance -= amount

        if (payer.balance >= 0) payerIndex++
        if (payee.balance <= 0) payeeIndex--
    }

    return transactions
}

module.exports = {
    calculateTransactions,
}
