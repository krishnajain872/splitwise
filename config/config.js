require('dotenv').config({ path: __dirname + '/../.env' })
const {
    DB_TEST: db_test,
    DB_DATABASE: db,
    user: user,
    PASSWORD: password,
    DB_HOST: host,
    DIALECT: db_dialect,
    DB_URL: url,
} = process.env

module.exports = {
    development: {
        use_env_variable: url,
        username: user,
        password: password,
        host: host,
        database: db,
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
        use_env_variable: url,
        username: user,
        password: password,
        host: host,
        database: db_test,
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
        use_env_variable: url,
        username: user,
        password: password,
        host: host,
        database: db,
        dialect: db_dialect,
        define: {
            underscored: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            deletedAt: 'deleted_at',
        },
    },
}
