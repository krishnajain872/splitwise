const { errorHelper } = require('./commonResponse.helper')

const validateRequest = (req, res, next, schema, parameterType) => {
    let requestData = {}
    if (parameterType === 'body') {
        requestData = req.body
    } else if (parameterType === 'query') {
        requestData = req.query
    } else {
        requestData = req.params
    }
    const value = schema.validate(requestData)
    if (!value.error) {
        if (parameterType === 'body') {
            req.body = value
        } else if (parameterType === 'query') {
            req.query = value
        } else {
            req.params = value
        }
        return next()
    }
    const error = value.error.details[0].message
    requestData = errorHelper(400, 'Bad request', error, value.error)

    res.send(requestData)
}

module.exports = {
    validateRequest,
}
