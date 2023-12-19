const Joi = require('joi')
const { validateRequest } = require('../helpers/validation.helper')
const signupSchema = (req, res, next) => {
    const schema = Joi.object({
        first_name: Joi.string().min(3).max(30).required().label('First Name'),
        last_name: Joi.string().min(3).max(30).required().label('Last Name'),
        email: Joi.string()
            .email({ tlds: { allow: false } }) // Disallow top-level domains to allow more email formats
            .lowercase()
            .trim()
            .required()
            .label('Email'),
        mobile: Joi.string()
            .length(10)
            .pattern(/^[0-9]+$/)
            .required()
            .label('Phone Number'),
        password: Joi.string().min(8).required().label('Password'), // Add a minimum length to the password for security
        avatar: Joi.string().uri(), // Validate that the avatar is a URI
    })
    validateRequest(req, res, next, schema, 'body')
}

const loginSchema = (req, res, next) => {
    const schema = Joi.object({
        mobile: Joi.string()
            .length(10)
            .pattern(/^[0-9]+$/)
            .required()
            .label('Phone Number'),
        password: Joi.string().required().label('Password'),
    })
    validateRequest(req, res, next, schema, 'body')
}
const forgetSchema = (req, res, next) => {
    const schema = Joi.object({
        mobile: Joi.string()
            .length(10)
            .pattern(/^[0-9]+$/)
            .required()
            .label('Phone Number'),
    })
    validateRequest(req, res, next, schema, 'body')
}
const resetSchema = (req, res, next) => {
    const schema = Joi.object({
        token: Joi.string().required().messages({
            'string.pattern.base': `"token" with value "{:token}" fails to match the required pattern: /^[a-fA-F0-9]+,[0-9]+$/`,
            'any.required': `"token" is a required field`,
        }),
        password: Joi.string().required().label('Password'),
    })
    validateRequest(req, res, next, schema, 'body')
}

const accessTokenSchema = (req, res, next) => {
    const schema = Joi.object({
        refresh_token: Joi.string()
            .pattern(/^[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+$/)
            .required()
            .messages({
                'string.pattern.base': `"refresh_token" with value "{:refresh_token}" fails to match the required pattern: /^[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+$/`,
                'any.required': `"refresh_token" is a required field`,
            }),
    })
    validateRequest(req, res, next, schema, 'body')
}

const verifySchema = (req, res, next) => {
    const schema = Joi.object({
        token: Joi.string().required().messages({
            'string.pattern.base': `"token" with value "{:token}" fails to match the required pattern: /^[a-fA-F0-9]+,[0-9]+$/`,
            'any.required': `"token" is a required field`,
        }),
    })
    validateRequest(req, res, next, schema, 'params')
}

module.exports = {
    signupSchema,
    loginSchema,
    accessTokenSchema,
    verifySchema,
    forgetSchema,
    resetSchema,
}
