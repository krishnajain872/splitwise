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

const responseHelper = async (req, res) => {
    const response = {
        statusCode: res.statusCode,
        data: res.data || {},
        message: 'Success',
    }
    return res.status(res.statusCode).json(response)
}
module.exports = {
    errorHelper,
    responseHelper,
}
