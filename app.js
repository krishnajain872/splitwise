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

// routes
const { NODE_ENV: api_env } = process.env
const api_route = `/api`

console.log(api_route)
app.use(api_route, api)

// health check
app.get('/health', (req, res) => {
    res.status(200).send('splitwise backend live')
})

app.get('/', (req, res) => {
    res.status(200).send('splitwise backend live')
})

module.exports = app
