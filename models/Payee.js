'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class Payee extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate() {
            // define association here
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
            currency: {
                type: DataTypes.ENUM,
                values: ['INR', 'USD'],
                defaultValue: 'INR',
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
