const errorHelper = async (
    req,
    res,
    message,
    statusCode = 500,
    error = null
) => {
    let errorMessage = 'Something went wrong. Please try again'
    if (message) {
        errorMessage = message
    }
    if (error && error.message) {
        errorMessage = error.message
    }
    req.error = error

    const response = {
        statusCode,
        data: {},
        message: errorMessage,
    }
    res.status(statusCode).json(response)
}

const responseHelper = (req, res, code, success, message, payload) => {
    const response = {
        code: code,
        success: success,
        data: { message: message || 'success', payload: payload },
    }
    return res.status(code).json(response)
}

module.exports = {
    errorHelper,
    responseHelper,
}
