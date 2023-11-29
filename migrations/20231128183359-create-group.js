'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('groups', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.literal('uuid_generate_v4()'),
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            display_picture: {
                type: Sequelize.STRING,
            },
            category: {
                type: Sequelize.ENUM,
                values: ['trip', 'home', 'couple', 'other', 'foodie'],
                defaultValue: 'other',
                allowNull: false,
            },
            admin_id: {
                allowNull: false,
                type: Sequelize.UUID,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
            },
            deleted_at: {
                allowNull: true,
                type: Sequelize.DATE,
                defaultValue: null,
            },
        })
    },
    async down(queryInterface) {
        await queryInterface.dropTable('groups')
    },
}
