const generic = require('./commonResponse.helper')

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
    const errorMessage = value.error.details[0].message
    generic.errorHelper(req, res, errorMessage, 400, value.error)
}

module.exports = {
    validateRequest,
}
