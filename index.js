const https = require('https')
const http = require('http')
const app = require('./app')
const fs = require('fs')
const { sequelize } = require('./models')
require('dotenv').config()
const {
    SERVER_PORT: port,
    SECURE_SERVER_PORT: secure,
    HOST: host,
} = process.env

const Server = async function () {
    try {
        await sequelize.authenticate()
        console.log('Database connectivity established successfully')
        const serverPort = port || 80
        const httpServer = http.createServer(app)
        httpServer.listen(serverPort, () => {
            console.log(
                ` splitwise-backend server started @ http://${host}:${serverPort}/ `
            )
        })
    } catch (err) {
        console.log('server setup failed', err)
        console.log('Error: ', err.message)
    }
}

const secureServer = async function () {
    try {
        // ssl certificates
        await sequelize.authenticate()
        console.log(
            'Database connectivity established in secure server successfully'
        )
        const options = {
            key: fs.readFileSync('/key.pem'),
            cert: fs.readFileSync('/cert.pem'),
        }
        const secure_server_port = secure || 403

        const httpsServer = https.createServer(options, app)
        httpsServer.listen(secure_server_port, () => {
            console.log(
                ` splitwise-backend secure server started @ https://${host}:${secure}/ `
            )
        })
    } catch (err) {
        console.log('secure server setup failed', err)
        console.log('Error: ', err.message)
    }
}

Server()
secureServer()
