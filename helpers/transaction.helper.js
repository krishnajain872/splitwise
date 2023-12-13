function calculateTransactions(expense, payees) {
    const baseAmountPerPerson = parseFloat((expense / payees.length).toFixed(2))
    let transactions = []
    let transactionData = {}

    let updatedPayees = payees.map((payee) => {
        let balance = parseFloat(
            (Number(payee.amount) - baseAmountPerPerson).toFixed(2)
        )
        transactionData['expense_id'] = payee.expense_id
        transactionData['currency_id'] = payee.currency_id
        return { ...payee, balance }
    })

    updatedPayees.sort((a, b) => a.balance - b.balance)

    let payerIndex = 0
    let payeeIndex = updatedPayees.length - 1

    while (payerIndex < payeeIndex) {
        let payer = updatedPayees[payerIndex]
        let payee = updatedPayees[payeeIndex]
        let amount = parseFloat(
            Math.min(-payer.balance, payee.balance).toFixed(2)
        )

        transactions.push({
            payer_id: payer.user_id,
            payee_id: payee.user_id,
            amount: amount === 0 ? Math.abs(amount) : amount,
            ...transactionData,
        })

        payer.balance += amount
        payee.balance -= amount

        if (payer.balance === 0) payerIndex++
        if (payee.balance === 0) payeeIndex--
    }
    return transactions
}

module.exports = {
    calculateTransactions,
}
