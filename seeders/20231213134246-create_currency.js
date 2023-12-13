'use strict'

module.exports = {
    up: async (queryInterface) => {
        await queryInterface.bulkInsert(
            'currencies',
            [
                {
                    code: 'INR',
                    name: 'Indian Rupee',
                    exchange_rate: '80.5',
                    created_at: new Date(),
                    created_at: new Date(),
                },
                {
                    code: 'USD',
                    name: 'United States Dollar',
                    exchange_rate: '1.00',
                    created_at: new Date(),
                    created_at: new Date(),
                },
                {
                    code: 'EUR',
                    name: 'Euro',
                    exchange_rate: '0.85',
                    created_at: new Date(),
                    created_at: new Date(),
                },
                {
                    code: 'JPY',
                    name: 'Japanese Yen',
                    exchange_rate: '110.00',
                    created_at: new Date(),
                    created_at: new Date(),
                },
                // Add more currencies as needed
            ],
            {}
        )
    },

    down: async (queryInterface) => {
        await queryInterface.bulkDelete('currencies', null, {})
    },
}
