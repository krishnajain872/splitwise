'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class Comment extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Comment.belongsTo(models.Expense, {
                as: 'expense_comment_details',
                foreignKey: 'expense_id',
                targetKey: 'id',
            })
            Comment.belongsTo(models.User, {
                as: 'user_comment_details',
                foreignKey: 'user_id',
                targetKey: 'id',
            })
        }
    }
    Comment.init(
        {
            type: {
                type: DataTypes.ENUM,
                values: ['USER', 'SYSTEM'],
                defaultValue: 'USER',
            },
            expense_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            user_id: {
                allowNull: true,
                type: DataTypes.UUID,
            },
        },
        {
            sequelize,
            modelName: 'Comment',
            tableName: 'comments',
            paranoid: true,
        }
    )
    return Comment
}
