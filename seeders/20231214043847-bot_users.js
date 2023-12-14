'use strict'
module.exports = {
    up: async (queryInterface) => {
        const botUsers = []
        for (let i = 1; i <= 9; i++) {
            botUsers.push({
                first_name: `Bot${i}`,
                last_name: `User${i}`,
                avatar: `bot${i}.jpg`,
                email: `bot${i}@example.com`,
                mobile: `123456789${i}`,
                password: `password${i}`,
                status: 'verified',
                created_at: new Date(),
                updated_at: new Date(),
            })
        }
        return queryInterface.bulkInsert(botUsers)
    },

    down: async (queryInterface) => {
        return queryInterface.bulkDelete('users', null, {})
    },
}
