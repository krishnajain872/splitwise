const { errorHelper } = require('./../helpers/commonResponse.helper')
const authService = require('../services/auth.service')

const userSignup = async (req, res, next) => {
    try {
        const { body: payload } = req

        const data = await authService.userRegistration(payload.value)
        res.data = data
        console.log('REGISTERED CONTROLLER DATA ==>', data)
        next()
    } catch (error) {
        console.log('User Registration error ==> ', error)
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}

const userLogin = async (req, res, next) => {
    try {
        const { body: payload } = req
        const data = await authService.userLogin(payload.value)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}

const generateAccessToken = async (req, res, next) => {
    try {
        const { body: payload } = req
        const data = await authService.generateAccessToken(payload.value)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}
const sendVerificationLink = async (req, res, next) => {
    try {
        const { body: payload } = req
        const data = await authService.sendVerificationLink(payload.value)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}
const verifyUser = async (req, res, next) => {
    try {
        const { params: payload } = req
        console.log('verify user CONTROLLER DATA ==>', payload)
        const data = await authService.userVerification(payload.value)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}

module.exports = {
    userSignup,
    userLogin,
    generateAccessToken,
    sendVerificationLink,
    verifyUser,
}
