const Joi = require('joi')

const { validateRequest } = require('../helpers/validation.helper')

const createGroupSchema = async (req, res, next) => {
    const schema = Joi.object({
        title: Joi.string().min(3).required(),
        display_picture: Joi.string().min(1).required(),
        category: Joi.string()
            .valid('trip', 'home', 'couple', 'other', 'foodie')
            .required(),
    })
    validateRequest(req, res, next, schema, 'body')
}
const addMemberSchema = async (req, res, next) => {
    const schema = Joi.object({
        id: Joi.string().guid().required(),
        member: Joi.array().items(Joi.string().guid().required()).required(),
    })
    validateRequest(req, res, next, schema, 'body')
}

const updateGroupSchema = async (req, res, next) => {
    const schema = Joi.object({
        id: Joi.string().guid().required(),
        title: Joi.string().min(3),
        display_picture: Joi.string().min(1),
        category: Joi.string().valid(
            'trip',
            'home',
            'couple',
            'other',
            'foodie'
        ),
    })
    validateRequest(req, res, next, schema, 'body')
}

const paramsIdCheck = async (req, res, next) => {
    const schema = Joi.object({
        id: Joi.string().guid().required(),
        user_id: Joi.string().guid(),
    })
    validateRequest(req, res, next, schema, 'params')
}

module.exports = {
    createGroupSchema,
    updateGroupSchema,
    addMemberSchema,
    paramsIdCheck,
}
