const https = require('https')
const http = require('http')
const app = require('./app')
const fs = require('fs')
require('dotenv').config()

const {
    SERVER_PORT: port,
    SECURE_SERVER_PORT: secure,
    HOST: host,
} = process.env

const Server = async function () {
    try {
        const serverPort = port || 80
        // Listen both http & https ports
        const httpServer = http.createServer(app)
        httpServer.listen(serverPort, () => {
            console.log(
                ` \nsplitwise-backend server started @ http://${host}:${serverPort}/ `
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
        const options = {
            key: fs.readFileSync('certificates/key.pem'),
            cert: fs.readFileSync('certificates/cert.pem'),
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
