const jwt = require('jsonwebtoken')
const db = require('./../models')
const User = db.User
const Joi = require('joi')
require('dotenv').config()
const generic = require('./../helpers/commonResponse.helper')

const schema = Joi.object({
    refresh_token: Joi.string()
        .pattern(/^[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+$/)
        .required()
        .min(10)
        .messages({
            'string.pattern.base': `"refresh_token" with value "{:refresh_token}" fails to match the required pattern: /^[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+$/`,
            'any.required': `"refresh_token" is a required field`,
        }),
})

const checkAccessToken = async (req, res, next) => {
    try {
        const accessToken = req.headers['authorization']?.split(' ')[1]

        const value = await schema.validate(accessToken)
        if (!value.error) {
            const error = new Error('access token is not valid ' + value.error)
            error.statusCode = 401
            throw error
        }
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
    const { refresh_token: refresh } = req.body
    const { JWT_REFRESH_TOKEN_SECRET: secret } = process.env

    if (!refresh) {
        const error = new Error('token not found')
        error.statusCode = 404
        throw error
    }

    const value = schema.validate(refresh)
    if (!value.error) {
        const error = new Error('refesh token is not valid ' + value.error)
        error.statusCode = 401
        throw error
    }

    let decodedJwt
    try {
        decodedJwt = await jwt.verify(refresh, secret)
    } catch (error) {
        if (
            ['jwt expired', 'jwt malformed', 'invalid signature'].includes(
                error.message.toLowerCase().trim()
            )
        ) {
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

    const user = await User.findByPk(decodedJwt.user_id)

    if (!user) {
        const error = new Error('User not found')
        error.statusCode = 404
        throw error
    }

    // Add user ID to the request object
    req.user = user.get({ plain: true }) // Use Sequelize's `get` method to get plain object
    // Call next middleware with user ID accessible
    next()
}

module.exports = {
    checkAccessToken,
    checkRefreshToken,
}
