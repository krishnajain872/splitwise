'use strict'
module.exports = {
    up: async (queryInterface) => {
        const botUsers = []
        for (let i = 1; i <= 9; i++) {
            let bot = {
                first_name: `Bot${i}`,
                last_name: `User${i}`,
                avatar: `bot${i}.jpg`,
                email: `bot${i}@example.com`,
                mobile: `123456789${i}`,
                password: `password${i}`,
                status: 'verified',
                created_at: new Date(),
                updated_at: new Date(),
            }
            botUsers.push(bot)
        }
        return queryInterface.bulkInsert('users', botUsers)
    },

    down: async (queryInterface) => {
        return queryInterface.bulkDelete('users', null, {})
    },
}
