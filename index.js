require('dotenv').config()
const { sequelize } = require('./models')
const app = require('./app')

const Server = async function () {
    try {
        const serverPort = process.env.SERVER_PORT || 3001
        app.listen(serverPort)
        console.log(` splitwise-backend server started : ${serverPort}  \n\n`)
    } catch (err) {
        console.log('server setup failed', err)
        console.log('Error: ', err.message)
    }
}

startServer()
