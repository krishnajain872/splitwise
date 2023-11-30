'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class Currency extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Currency.hasMany(models.Expense, {
                foreignKey: 'currency_id',
                as: 'expense_currency',
            })
        }
    }
    Currency.init(
        {
            code: {
                type: DataTypes.UUID,
                allowNull: false,
                unique: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            exchange_rate: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'Currency',
            tableName: 'currencies',
            paranoid: true,
        }
    )
    return Currency
}
