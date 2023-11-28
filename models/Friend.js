'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class FriendList extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            FriendList.belongsTo(models.User, {
                as: 'user_details',
                foreignKey: 'user_id',
                targetKey: 'id',
            })
            FriendList.belongsTo(models.User, {
                as: 'friend_details',
                foreignKey: 'friend_id',
                targetKey: 'id',
            })
        }
    }
    FriendList.init(
        {
            user_id: {
                type: DataTypes.UUIDV4,
                allowNull: false,
            },
            friend_id: {
                type: DataTypes.UUIDV4,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'FriendList',
            tableName: 'friends_list',
            paranoid: true,
        }
    )
    return FriendList
}
