'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class GroupUserMapping extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            GroupUserMapping.belongsTo(models.User, {
                as: 'user_details',
                foreignKey: 'user_id',
                targetKey: 'id',
            })
            GroupUserMapping.belongsTo(models.Group, {
                as: 'group_details',
                foreignKey: 'group_id',
                targetKey: 'id',
            })
        }
    }
    GroupUserMapping.init(
        {
            user_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            group_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'GroupUserMapping',
            tableName: 'groups_users',
            paranoid: true,
        }
    )
    return GroupUserMapping
}
