const jwt = require('jsonwebtoken')
const db = require('./../models')
const User = db.User
require('dotenv').config()
const generic = require('./../helpers/commonResponse.helper')

const checkAccessToken = async (req, res, next) => {
    const accessToken = req.headers['authorization']?.split(' ')[1]

    const { JWT_AUTH_TOKEN_SECRET: secret } = process.env

    if (!accessToken) {
        const error = new Error('UnAuthorized Access')
        error.statusCode = 401
        throw error
    }
    try {
        const decodedJwt = await jwt.verify(accessToken, secret)

        const user = await User.findByPk({
            where: {
                id: decodedJwt.id,
            },
        })

        if (!user) {
            const error = new Error('User not found')
            error.statusCode = 404
            throw error
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

    next()
}
const checkRefreshToken = async (req, res, next) => {
    const refresh = req.body.refresh_token

    const { JWT_REFRESH_TOKEN_SECRET: secret } = process.env

    if (!refresh) {
        const error = new Error('UnAuthorized Access')
        error.statusCode = 401
        throw error
    }
    try {
        const decodedJwt = await jwt.verify(refresh, secret)

        const user = await User.findByPk({
            where: {
                id: decodedJwt.id,
            },
        })

        if (!user) {
            const error = new Error('User not found')
            error.statusCode = 404
            throw error
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

    next()
}

module.exports = {
    checkAccessToken,
    checkRefreshToken,
}
