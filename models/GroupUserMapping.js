'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class GroupUserMapping extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate() {
            // define association here
        }
    }
    GroupUserMapping.init(
        {
            user_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            friend_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'GroupUserMapping',
            tableName: 'group_user_mapping',
            paranoid: true,
        }
    )
    return GroupUserMapping
}
