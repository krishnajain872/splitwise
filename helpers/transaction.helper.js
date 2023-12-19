function calculateTransactions(expense, payees) {
    let transactions = []

    let updatedPayees = payees.map((payee) => {
        let amount = Number(payee.amount)
        let calculatedShare = Number(expense) / payees.length
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
function calculateTransactionsByShare(expense, payees) {
    let transactions = []

    let updatedPayees = payees.map((payee) => {
        let share = Number(payee.share)
        let amount = Number(payee.amount)
        let calculatedShare = share ? Number(share) : 0
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
    calculateTransactionsByShare,
}
