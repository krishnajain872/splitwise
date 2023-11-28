const errorHandler = async (
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
        message = error.message
    }
    req.error = error

    const response = {
        statusCode,
        data: {},
        message: errorMessage,
    }

    res.status(statusCode).json(response)
}

const sendResponse = async (req, res) => {
    const response = {
        statusCode: res.statusCode,
        data: res.data || {},
        message: 'Success',
    }
    return res.status(res.statusCode).json(response)
}

module.exports = {
    errorHandler,
    sendResponse,
}
