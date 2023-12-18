'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class Payee extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Payee.belongsTo(models.User, {
                as: 'user_details',
                foreignKey: 'user_id',
                targetKey: 'id',
            })
            Payee.belongsTo(models.Expense, {
                as: 'expense_details',
                foreignKey: 'expense_id',
                targetKey: 'id',
            })
            Payee.belongsTo(models.Currency, {
                as: 'payee_currency',
                foreignKey: 'currency_id',
                targetKey: 'id',
            })
            Payee.belongsTo(models.Expense, {
                as: 'expense_payee',
                foreignKey: 'expense_id',
                targetKey: 'id',
            })
        }
    }
    Payee.init(
        {
            user_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            expense_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            amount: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            share: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            currency_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'Payee',
            tableName: 'payees',
            paranoid: true,
        }
    )
    return Payee
}
