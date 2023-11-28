require('dotenv').config({ path: __dirname + '/../.env' })
const {
    DB_TEST: db_test,
    DB_DATABASE: db,
    USER_NAME: user,
    PASSWORD: password,
    DIALECT: db_dialect,
    DB_HOST: host,
} = process.env

module.exports = {
    development: {
        username: user,
        password: password,
        database: db,
        host: host,
        dialect: db_dialect,
        logging: false,
        define: {
            underscored: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            deletedAt: 'deleted_at',
        },
    },
    test: {
        username: user,
        password: password,
        database: db_test,
        host: host,
        dialect: db_dialect,
        logging: false,
        define: {
            underscored: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            deletedAt: 'deleted_at',
        },
    },
    production: {
        username: user,
        password: password,
        database: db,
        host: host,
        dialect: db_dialect,
        define: {
            underscored: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            deletedAt: 'deleted_at',
        },
    },
}
