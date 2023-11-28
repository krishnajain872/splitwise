const errorHelper = (code, name, message, actual) => {
    return {
        code: code,
        success: false,
        name: name,
        message: message,
        actual: actual,
    }
}
const responseHelper = (code, success, message, payload) => {
    return {
        code: code,
        success: success,
        data: { message: message, payload: payload },
    }
}

module.exports = {
    errorHelper,
    responseHelper,
}
