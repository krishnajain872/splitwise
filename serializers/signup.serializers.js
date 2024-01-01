const { dateHelper } = require('../helpers/date.helper')

const userSignupData = async (res, next) => {
    let recievedData = res.data || {}
    let resultData
    if (recievedData) {
        resultData = {
            id: recievedData.id,
            firstName: recievedData.first_name,
            lastName: recievedData.last_name,
            mobile: recievedData.mobile,
            status: recievedData.status,
            email: recievedData.email,
            createdAt: dateHelper(recievedData.created_at),
            accessToken: recievedData.accessToken,
        }
    }
    res.data = resultData
    next()
}
const userSendVerification = async (res, next) => {
    let recievedData = res.data.dataValues || {}
    let resultData
    if (recievedData) {
        resultData = {
            id: recievedData.id,
            firstName: recievedData.first_name,
            lastName: recievedData.last_name,
            mobile: recievedData.mobile,
            status: recievedData.status,
            email: recievedData.email,
            token: recievedData.token,
        }
    }
    res.data = resultData
    next()
}
const userVerification = async (res, next) => {
    let recievedData = res.data.dataValues || {}
    let resultData
    if (recievedData) {
        resultData = {
            id: recievedData.id,
            firstName: recievedData.first_name,
            lastName: recievedData.last_name,
            mobile: recievedData.mobile,
            status: recievedData.status,
            email: recievedData.email,
            verifiedAt: dateHelper(recievedData.updated_at),
        }
    }
    res.data = resultData
    next()
}
const userLogin = async (res, next) => {
    let recievedData = res.data.dataValues || {}
    let resultData
    if (recievedData) {
        resultData = {
            id: recievedData.id,
            firstName: recievedData.first_name,
            lastName: recievedData.last_name,
            mobile: recievedData.mobile,
            status: recievedData.status,
            email: recievedData.email,
            accessToken: recievedData.accessToken,
            refreshToken: recievedData.refresh_token,
        }
    }
    res.data = resultData
    next()
}
const userResetPassword = async (res, next) => {
    let recievedData = res.data.dataValues || {}
    let resultData
    if (recievedData) {
        resultData = {
            id: recievedData.id,
            firstName: recievedData.first_name,
            lastName: recievedData.last_name,
            mobile: recievedData.mobile,
            status: recievedData.status,
            email: recievedData.email,
            passwordUpdateAt: dateHelper(recievedData.updated_at),
        }
    }
    res.data = resultData
    next()
}
const userGenerateAccessToken = async (res, next) => {
    let recievedData = res.data.dataValues || {}
    let resultData
    if (recievedData) {
        resultData = {
            id: recievedData.id,
            firstName: recievedData.first_name,
            lastName: recievedData.last_name,
            mobile: recievedData.mobile,
            status: recievedData.status,
            email: recievedData.email,
            accessToken: recievedData.accessToken,
            refreshToken: recievedData.refresh_token,
        }
    }
    res.data = resultData
    next()
}

module.exports = {
    userSignupData,
    userSendVerification,
    userVerification,
    userLogin,
    userResetPassword,
    userGenerateAccessToken,
}
