const express = require('express')
const bodyParser = require('body-parser')
const router = express.Router()
const app = express()
const api = require('./routes')
require('dotenv').config()
// routes and bodyparsers
app.use(router)
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const api_route = `/api`
app.use(api_route, api)
// health check
app.get('/health', (req, res) => {
    res.status(200).send('splitwise backend health check ....')
    console.log('\n\nsplitwise backend live\n\n')
})

//root
app.get('/', (req, res) => {
    res.status(200).send('Splitwise backend live')
})

module.exports = app
