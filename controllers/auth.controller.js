const { errorHelper } = require('./../helpers/commonResponse.helper')
const authService = require('../services/auth.service')

const userSignup = async (req, res, next) => {
    try {
        const { body: payload } = req
        const data = await authService.userRegistration(payload.value)
        res.data = data

        next()
    } catch (error) {
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
        let payload = {}
        payload.user_id = req.user.id
        payload.email = req.user.email
        const data = await authService.sendVerificationLink(payload)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}
const verifyUser = async (req, res, next) => {
    try {
        const { params: payload } = req
        const data = await authService.userVerification(payload.value)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}
const forgetPassword = async (req, res, next) => {
    try {
        const { value: payload } = req.body
        // console.log('THIS IS CONTROLLER FOR FORGET PASSWORD===> ', req.body)
        const data = await authService.forgetPassword(payload.mobile)
        res.data = data
        next()
    } catch (error) {
        errorHelper(req, res, error.message, error.statusCode, error)
    }
}
const resetPassword = async (req, res, next) => {
    try {
        const { body: payload } = req
        const data = await authService.resetPassword(payload.value)
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
    resetPassword,
    forgetPassword,
}
