'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('payees', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.literal('uuid_generate_v4()'),
            },
            currency_id: {
                allowNull: false,
                type: Sequelize.UUID,
                references: {
                    model: 'currencies',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            user_id: {
                allowNull: false,
                type: Sequelize.UUID,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            expense_id: {
                allowNull: false,
                type: Sequelize.UUID,
                references: {
                    model: 'expenses',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            amount: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            share: {
                type: Sequelize.STRING,
                allowNull: true,
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
        await queryInterface.dropTable('payees')
    },
}
