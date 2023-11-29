'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class Expense extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Expense.belongsTo(models.Group, {
                as: 'group_details',
                foreignKey: 'group_id',
                targetKey: 'id',
            })
        }
    }
    Expense.init(
        {
            category: {
                type: DataTypes.ENUM,
                values: ['transport', 'food', 'game', 'other'],
                defaultValue: 'other',
            },
            description: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            group_id: {
                allowNull: true,
                type: DataTypes.UUID,
            },
            base_ammount: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            split_by: {
                type: DataTypes.ENUM,
                values: ['equal', 'share'],
                defaultValue: 'equal',
            },
        },
        {
            sequelize,
            modelName: 'Expense',
        }
    )
    return Expense
}
