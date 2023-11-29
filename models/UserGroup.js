'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class UserGroup extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            UserGroup.belongsTo(models.User, {
                as: 'user_details',
                foreignKey: 'user_id',
                targetKey: 'id',
            })
            UserGroup.belongsTo(models.Group, {
                as: 'group_details',
                foreignKey: 'group_id',
                targetKey: 'id',
            })
        }
    }
    UserGroup.init(
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
            modelName: 'UserGroup',
            tableName: 'users_groups',
            paranoid: true,
        }
    )
    return UserGroup
}
