const fs = require('fs')
require('dotenv').config({ path: __dirname + '/../.env' })
const {
    DB_TEST: db_test,
    DB_DATABASE: db,
    USER_NAME: user,
    PASSWORD: password,
    DIALECT: db_dialect,
    DB_HOST: host,
    DB_URL: url,
} = process.env

module.exports = {
    development: {
        use_env_variable: url,
        username: user,
        password: password,
        database: db,
        host: host,
        dialect: db_dialect,
        dialectOptions: {
            ssl: {
                ca: fs.readFileSync(__dirname + '/../psql.pem'),
            },
        },
        logging: false,
        define: {
            underscored: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            deletedAt: 'deleted_at',
        },
    },
    test: {
        use_env_variable: url || undefined,
        username: user,
        password: password,
        database: db_test,
        host: host,
        dialect: db_dialect,
        dialectOptions: {
            ssl: {
                ca: fs.readFileSync(__dirname + '/../psql.pem'),
            },
        },
        logging: false,
        define: {
            underscored: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            deletedAt: 'deleted_at',
        },
    },
    production: {
        use_env_variable: url || undefined,
        username: user,
        password: password,
        database: db,
        host: host,
        dialect: db_dialect,
        dialectOptions: {
            ssl: {
                ca: fs.readFileSync(__dirname + '/../psql.pem'),
            },
        },
        define: {
            underscored: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            deletedAt: 'deleted_at',
        },
    },
}
