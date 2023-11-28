const { errorHandler } = require('./commonResponse.helper')

const validateRequest = (req, res, next, schema, parameterType) => {
    let requestData = {}
    if (parameterType === 'body') {
        requestData = req.body
    } else if (parameterType === 'query') {
        requestData = req.query
    } else {
        requestData = req.params
    }
    const { value, error } = schema.validate(requestData)

    if (!error) {
        if (parameterType === 'body') {
            req.body = value
        } else if (parameterType === 'query') {
            req.query = value
        } else {
            req.params = value
        }
        return next()
    }
    return errorHandler(req, res, error.message, error)
}

module.exports = {
    validateRequest,
}
