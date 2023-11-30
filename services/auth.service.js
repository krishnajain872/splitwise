const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const db = require('../models')
const User = db.User

const {
    JWT_REFRESH_TOKEN_EXPIRATION: refresh_expire,
    JWT_REFRESH_TOKEN_SECRET: refresh_secret,
    JWT_AUTH_TOKEN_SECRET: auth_secret,
    JWT_AUTH_TOKEN_EXPIRATION: auth_expire,
} = process.env

const userRegistration = async (payload) => {
    const { PASSWORD_HASH_SALTS: salt } = process.env
    payload.password = await bcrypt.hash(payload.password, salt)

    const existingUser = await models.User.findOne({
        where: { mobile: payload.mobile },
    })
    if (existingUser) {
        const error = new Error('user already registered')
        error.statusCode = 409
        throw error
    }
    payload.status = 'dummy'
    const user = await User.create(payload)
    return user
}

const userLogin = async (payload) => {
    const { mobile, password } = payload
    const user = await models.User.findOne({
        where: {
            mobile: mobile,
        },
    })
    if (!user) {
        const error = new Error('user not found!')
        error.statusCode = 404
        throw error
    }
    const match = await bcrypt.compareSync(password, user.dataValues.password)
    if (!match) {
        const error = new Error('UnAuthorized Access')
        error.statusCode = 401
        throw error
    }
    refresh_token = jwt.sign({ user_id: user.dataValues.id }, refresh_secret, {
        expiresIn: refresh_expire,
    })

    const accessToken = jwt.sign({ userId: user.dataValues.id }, auth_secret, {
        expiresIn: auth_expire,
    })

    return {
        id: user.id,
        mobile: user.dataValues.mobile,
        email: user.dataValues.email,
        accessToken: accessToken,
    }
}

const generateAccessToken = async (paylaod) => {
    const { refresh_token: refresh } = paylaod
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
    let newAccessToken = jwt.sign({ user_id: paylaod.user_id }, auth_secret, {
        expiresIn: auth_expire,
    })
    return {
        accessToken: newAccessToken,
        refresh_token,
    }
}

// const userVerification = async (payload)=>{
//     const token = ""

// }

module.exports = {
    userRegistration,
    userLogin,
    generateAccessToken,
    // userVerification,
}
