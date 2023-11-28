'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class Friend_List extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Friend_List.belongsTo(models.User, {
                as: 'user_details',
                foreignKey: 'user_id',
                targetKey: 'id',
            })
            Friend_List.belongsTo(models.User, {
                as: 'friend_details',
                foreignKey: 'friend_id',
                targetKey: 'id',
            })
        }
    }
    Friend_List.init(
        {
            id: {
                type: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true,
                defaultValue: UUIDV4,
            },
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
            modelName: 'Friend_List',
            tableName: 'friends_list',
            paranoid: true,
        }
    )
    return Friend
}
