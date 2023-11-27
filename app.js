const express = require('express')
const bodyParser = require('body-parser')
const router = express.Router()
const app = express()

// routes and bodyparsers
app.use(router)
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get('/health', (req, res) => {
    res.status(200).send('splitwise backend live')
})

module.exports = app
