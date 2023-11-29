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
            base_ammount: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            split_by: {
                type: Sequelize.ENUM,
                values: ['equal', 'share'],
                defaultValue: 'equal',
            },
        })
    },
    async down(queryInterface) {
        await queryInterface.dropTable('expenses')
    },
}
