'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            User.belongsToMany(models.FriendList, {
                foreignKey: 'user_id',
                as: 'user',
            })
            User.belongsToMany(models.FriendList, {
                foreignKey: 'friend_id',
                as: 'friend',
            })

            User.belongsToMany(models.Group, {
                through: models.GroupUserMapping,
                foreignKey: 'user_id',
                as: 'groups',
            })

            User.hasMany(models.Group, {
                foreignKey: 'admin_id',
                as: 'group-admin',
            })
        }
    }
    User.init(
        {
            first_name: {
                type: DataTypes.STRING,
                allowNull: false,
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
                unique: true,
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
