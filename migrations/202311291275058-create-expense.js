'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('expenses', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.literal('uuid_generate_v4()'),
            },
            category: {
                type: Sequelize.ENUM,
                values: ['transport', 'food', 'game', 'other'],
                defaultValue: 'other',
            },
            description: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            currency_id: {
                allowNull: true,
                type: Sequelize.UUID,
                references: {
                    model: 'currencies',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            group_id: {
                allowNull: true,
                type: Sequelize.UUID,
                references: {
                    model: 'groups',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            base_amount: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            split_by: {
                type: Sequelize.ENUM,
                values: ['equal', 'share'],
                defaultValue: 'equal',
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('now()'),
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('now()'),
            },
            deleted_at: {
                allowNull: true,
                type: Sequelize.DATE,
                defaultValue: null,
            },
        })
    },
    async down(queryInterface) {
        await queryInterface.dropTable('expenses')
    },
}
