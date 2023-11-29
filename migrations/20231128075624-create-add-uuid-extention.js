'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.sequelize.query(
            'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
        )
    },

    async down(queryInterface) {
        await queryInterface.sequelize.query(
            'DROP EXTENSION IF EXISTS "uuid-ossp";'
        )
    },
}
