'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class Transaction extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of DataTypes lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate() {
            // define association here
        }
    }
    Transaction.init(
        {
            currency_id: {
                allowNull: false,
                type: DataTypes.UUID,
            },
            payer_id: {
                allowNull: false,
                type: DataTypes.UUID,
            },
            payee_id: {
                allowNull: false,
                type: DataTypes.UUID,
            },
            expense_id: {
                allowNull: false,
                type: DataTypes.UUID,
            },
            amount: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            settel_up_at: {
                type: DataTypes.DATE,
            },
        },
        {
            sequelize,
            modelName: 'Transaction',
        }
    )
    return Transaction
}
