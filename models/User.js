'use strict'
const { Model, UUIDV4 } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            User.hasMany(models.Transaction, {
                foreignKey: 'payee_id',
                as: 'transactions_as_payee',
            })
            User.hasMany(models.Transaction, {
                foreignKey: 'payer_id',
                as: 'transactions_as_payer',
            })
            User.hasMany(models.Friend_List, {
                foreignKey: 'user_id',
                as: 'user',
            })
            User.hasMany(models.Friend_List, {
                foreignKey: 'friend_id',
                as: 'friend',
            })
            User.belongsToMany(models.Group, {
                through: models.Group_user_mapping,
                foreignKey: 'user_id',
                as: 'groups',
            })
            User.belongsToMany(models.Expense, {
                through: models.Payee,
                foreignKey: 'user_id',
                as: 'payee',
            })
            User.hasMany(models.Group, {
                foreignKey: 'admin_id',
                as: 'group-admin',
            })
            User.hasMany(models.Comment, {
                foreignKey: 'user_id',
                as: 'user',
            })
        }
    }
    User.init(
        {
            id: {
                type: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true,
                defaultValue: UUIDV4,
            },
            first_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            last_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            mobile: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM,
                values: ['verified', 'invited', 'dummy'],
                defaultValue: 'dummy',
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'User',
            tableName: 'users',
            paranoid: true,
        }
    )
    return User
}
