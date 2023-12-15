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
        const user = await User.findByPk(decodedJwt.user_id, {
            attributes: ['first_name', 'last_name', 'id', 'mobile', 'email'],
        })

        if (!user) {
            const error = new Error('User not found')
            error.statusCode = 404
            throw error
        } else {
            // Add user ID to the request object
            req.user = user.dataValues
            // Call next middleware with user ID accessible
            next()
        }
    } catch (error) {
        if (error.message.toLowerCase().trim() === 'jwt expired') {
            error.statusCode = 401
        }
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
        console.log('refreshToken middlware PAYLAOD  ==>> ', refresh)
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
        const user = await User.findByPk(decodedJwt.user_id, {
            attributes: ['first_name', 'last_name', 'id', 'mobile', 'email'],
        })

        if (!user) {
            const error = new Error('User not found')
            error.statusCode = 404
            throw error
        } else {
            // Add user ID to the request object
            req.user = user.dataValues
            // Call next middleware with user ID accessible
            next()
        }
    } catch (error) {
        if (error.message.toLowerCase().trim() === 'jwt expired') {
            error.statusCode = 401
        }
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
