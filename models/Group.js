'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class Group extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Group.belongsTo(models.User, {
                as: 'admin_details',
                foreignKey: 'admin_id',
                targetKey: 'id',
            })
            Group.belongsToMany(models.User, {
                through: models.GroupUserMapping,
                foreignKey: 'group_id',
                as: 'groups',
            })
            Group.hasMany(models.Expense, {
                foreignKey: 'group_id',
                as: 'group_expenses',
            })
        }
    }
    Group.init(
        {
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            icon: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            admin_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            category: {
                type: DataTypes.ENUM,
                values: ['trip', 'home', 'couple', 'other', 'foodie'],
                defaultValue: 'other',
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'Group',
            tableName: 'groups',
            paranoid: true,
        }
    )
    return Group
}
