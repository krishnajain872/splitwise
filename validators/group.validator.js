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
        member: Joi.array().items(Joi.string().guid().required()).required(),
    })
    validateRequest(req, res, next, schema, 'body')
}

const updateGroupSchema = async (req, res, next) => {
    const schema = Joi.object({
        title: Joi.string().min(3),
        display_picture: Joi.string(),
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

const expenseSchema = async (req, res, next) => {
    const payeeSchema = Joi.object({
        user_id: Joi.string().guid().required(),
        amount: Joi.number().precision(2).required(),
        share: Joi.number().precision(2),
    })
    const expenseSchema = Joi.object({
        base_amount: Joi.number().precision(2).required(),
        split_by: Joi.string().valid('equal', 'share').required(),
        category: Joi.string().required(),
        currency_id: Joi.string().guid().required(),
        description: Joi.string().required(),
        member: Joi.array().items(payeeSchema).min(1).required(),
        group_id: Joi.string().guid(),
    })

    validateRequest(req, res, next, expenseSchema, 'body')
}
const paramsIdCheck = async (req, res, next) => {
    const schema = Joi.object({
        id: Joi.string().guid().required(),
        user_id: Joi.string().guid(),
    })
    validateRequest(req, res, next, schema, 'params')
}
const expenseIdCheck = async (req, res, next) => {
    const schema = Joi.object({
        id: Joi.string().guid(),
        expense_id: Joi.string().guid().required(),
    })
    validateRequest(req, res, next, schema, 'params')
}

module.exports = {
    createGroupSchema,
    updateGroupSchema,
    addMemberSchema,
    expenseSchema,
    paramsIdCheck,
    expenseIdCheck,
}
