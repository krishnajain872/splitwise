require('dotenv').config()
const https = require('https')
const app = require('./app')

const { SERVER_PORT: port } = process.env

const Server = async function () {
    try {
        const serverPort = port || 3001
        app.listen(serverPort)
        console.log(` splitwise-backend server started : ${serverPort}  \n\n`)
    } catch (err) {
        console.log('server setup failed', err)
        console.log('Error: ', err.message)
    }
}

Server()
