const jwt = require('jsonwebtoken')
const db = require('./../models')
const User = db.User
require('dotenv').config()
const generic = require('./../helpers/commonResponse.helper')

const checkAccessToken = async (req, res, next) => {
    try {
        const accessToken = req.headers['authorization']?.split(' ')[1]

        const { JWT_AUTH_TOKEN_SECRET: secret } = process.env

        if (!accessToken) {
            const error = new Error('UnAuthorized Access')
            error.statusCode = 401
            throw error
        }
        const decodedJwt = await jwt.verify(accessToken, secret)
        if (!decodedJwt) {
            const error = new Error('UnAuthorized Access')
            error.statusCode = 401
            throw error
        }
        const user = await User.findByPk({
            where: {
                id: decodedJwt.id,
            },
        })

        if (!user) {
            const error = new Error('User not found')
            error.statusCode = 404
            throw error
        } else {
            next()
        }
    } catch (error) {
        return generic.errorHelper(
            req,
            res,
            error.message,
            error.statusCode,
            error
        )
    }
}
const checkRefreshToken = async (req, res, next) => {
    try {
        const refresh = req.body.refresh_token

        const { JWT_REFRESH_TOKEN_SECRET: secret } = process.env

        if (!refresh) {
            const error = new Error('UnAuthorized Access')
            error.statusCode = 401
            throw error
        }
        const decodedJwt = await jwt.verify(refresh, secret)
        if (!decodedJwt) {
            const error = new Error('UnAuthorized Access')
            error.statusCode = 401
            throw error
        }
        const user = await User.findByPk({
            where: {
                id: decodedJwt.id,
            },
        })

        if (!user) {
            const error = new Error('User not found')
            error.statusCode = 404
            throw error
        } else {
            next()
        }
    } catch (error) {
        return generic.errorHelper(
            req,
            res,
            error.message,
            error.statusCode,
            error
        )
    }
}

module.exports = {
    checkAccessToken,
    checkRefreshToken,
}
