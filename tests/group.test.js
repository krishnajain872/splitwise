const request = require('supertest')
const { faker } = require('@faker-js/faker')
const app = require('../app')
const bcrypt = require('bcrypt')
const { User } = require('../models')
const { UserGroup } = require('../models')
const { Group } = require('../models')

// user payload
const userFakeData = () => {
    return {
        first_name: faker.internet.userName(),
        last_name: faker.internet.userName(),
        email: process.env.RECEIVER_EMAIL,
        avatar: faker.image.avatar(),
        password: faker.internet.password(),
        mobile: String(faker.number.int({ min: 1000000000, max: 9999999999 })),
    }
}

const categories = ['trip', 'home', 'couple', 'other', 'foodie']
const category = categories[Math.floor(Math.random() * categories.length)]

const groupFakeData = () => {
    return {
        title: faker.person.fullName(),
        display_picture: faker.image.avatar(),
        category: category,
    }
}
let group_data = groupFakeData()

const expense_categories = ['transport', 'food', 'game', 'other']
const expense_category =
    expense_categories[Math.floor(Math.random() * expense_categories.length)]

const split_by = ['equal', 'share']
const split = split_by[Math.floor(Math.random() * split_by.length)]
// expence payload
const expenseFakeData = () => {
    return {
        description: faker.lorem.lines(1),
        base_amount: 2000,
        category: expense_category,
        split_by: split,
    }
}

const data = faker.helpers.multiple(userFakeData, {
    count: 10,
})

let user
let group_id
let expense_group_id
let verified_user_access_token
let non_verified_user_access_token
let non_verified_user_access_token2
let user_not_found_access_token
let non_member_token
let member
let currency
let expense
// let baseAmount
// let payer_id
// let payee_id
let expense_payload
beforeAll(async () => {
    await User.truncate()
    const password = await bcrypt.hash(data[0].password, 10)
    const payload = [
        {
            ...data[0], //admin
            password,
            status: 'verified',
        },
        {
            ...data[1],
            password,
            status: 'verified',
        },
        {
            ...data[2],
            password,
        },
        {
            ...data[3],
            password,
        },
        {
            ...data[4],
            password,
        },
        {
            ...data[5],
            password,
        },
    ]

    user = await User.bulkCreate(payload)
    member = [
        user[1].dataValues.id, //verified
        user[2].dataValues.id, //non verified
        user[5].dataValues.id, //non verified
    ]

    const verified_user_response = await request(app)
        .post('/api/auth/login')
        .send({ mobile: data[0].mobile, password: data[0].password }) //admin
    verified_user_access_token = verified_user_response.body.data.accessToken

    const non_verified_user_response = await request(app)
        .post('/api/auth/login')
        .send({ mobile: data[2].mobile, password: data[0].password })
    non_verified_user_access_token =
        non_verified_user_response.body.data.accessToken
    const non_verified_user_response2 = await request(app)
        .post('/api/auth/login')
        .send({ mobile: data[5].mobile, password: data[0].password })
    non_verified_user_access_token2 =
        non_verified_user_response2.body.data.accessToken

    const user_not_found_response = await request(app)
        .post('/api/auth/login')
        .send({ mobile: data[3].mobile, password: data[0].password })
    user_not_found_access_token = user_not_found_response.body.data.accessToken

    const non_member_response = await request(app)
        .post('/api/auth/login')
        .send({ mobile: data[4].mobile, password: data[0].password })
    non_member_token = non_member_response.body.data.accessToken

    const currency_response = await request(app)
        .get('/api/currencies')
        .set('authorization', `Bearer ${verified_user_access_token}`)
    currency = currency_response.body
    expense_payload = {
        ...expenseFakeData(),
        split_by: 'equal',
        currency_id: currency[0].id,
        member: [
            {
                user_id: user[0].dataValues.id,
                amount: 1800,
            },
            {
                user_id: user[1].dataValues.id,
                amount: 200,
            },
            {
                user_id: user[2].dataValues.id,
                amount: 0,
            },
        ],
    }
    const group_response = await request(app)
        .post('/api/groups/')
        .set('authorization', `Bearer ${verified_user_access_token}`)
        .send(groupFakeData())
    expense_group_id = group_response.body.data.id
    const expense_response = await request(app)
        .post(`/api/groups/${expense_group_id}/expense/`)
        .set('authorization', `Bearer ${verified_user_access_token}`)
        .send(expense_payload)
    expense = expense_response.body

    console.log('THIS IS EXPENSES ===> ', expense.data.expense.id)
    await request(app)
        .post(`/api/groups/${expense_group_id}/member/add`)
        .set('authorization', `Bearer ${verified_user_access_token}`)
        .send({ member: member })
    console.log('THESE ARE REQURIRED expense ====>  ', expense)
    await User.destroy({
        where: {
            id: user[3].dataValues.id,
        },
    })
})

// create group
describe('TEST POST api/groups/  create group API', () => {
    // Test case for successful user registration
    it('should create a group with correct data and current login admin as user', async () => {
        const response = await request(app)
            .post('/api/groups/')
            .set('authorization', `Bearer ${verified_user_access_token}`)
            .send(groupFakeData())
        expect(response.statusCode).toEqual(200)
        expect(response.body.message).toEqual('Success')
        expect(response.body.data).toHaveProperty('admin_id')
        expect(response.body.data).toHaveProperty('id')
        expect(response.body.data).toHaveProperty('member')
        user_id = response.body.data.admin_id
        group_id = response.body.data.id
    })
    // Test case for missing required fields
    it('should fail when required fields are missing', async () => {
        const incompleteData = { ...groupFakeData(), category: '' }
        delete incompleteData.category // remove the email field
        const res = await request(app)
            .post('/api/groups/')
            .set('authorization', `Bearer ${verified_user_access_token}`)
            .send(incompleteData)
        expect(res.statusCode).toEqual(400)
    })
    // Test case for invalid email format
    it('should fail and return  un authorized access when access token not find or expired or invalid', async () => {
        const res = await request(app).post('/api/groups/').send(group_data)
        expect(res.statusCode).toEqual(401)
    })

    it('should fail and return  un authorized access when access token  of non verified user', async () => {
        const res = await request(app)
            .post('/api/groups/')
            .set('authorization', `Bearer ${non_verified_user_access_token}`)
            .send(group_data)
        expect(res.statusCode).toEqual(403)
    })
    it('should fail and return user not found when access token of non existing user', async () => {
        const res = await request(app)
            .post('/api/groups/')
            .set('authorization', `Bearer ${user_not_found_access_token}`)
            .send(group_data)
        expect(res.statusCode).toEqual(404)
    })
})

// add members
describe('TEST POST api/groups/id/member/add   add member in group API', () => {
    // Test case for successful user registration
    it('should create a group with correct data and current login admin as user', async () => {
        const response = await request(app)
            .post(`/api/groups/${group_id}/member/add`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
            .send({ member: member })
        expect(response.statusCode).toEqual(200)
        expect(response.body.message).toEqual('Success')
    })
    // Test case for missing required fields
    it('should fail when required fields are missing', async () => {
        const incompleteData = { ...data[2] }
        delete incompleteData.category // remove the email field
        const res = await request(app)
            .post(`/api/groups/${group_id}/member/add`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
            .send(incompleteData)
        expect(res.statusCode).toEqual(400)
    })

    // Test case for missing required fields
    it('should fail when a user non belongs to group try to access the add member route ', async () => {
        const incompleteData = { ...data[2] }
        delete incompleteData.category // remove the email field
        const res = await request(app)
            .post(`/api/groups/${group_id}/member/add`)
            .set('authorization', `Bearer ${non_member_token}`)
            .send(incompleteData)
        expect(res.statusCode).toEqual(403)
    })
    it('should fail when a user non verified tried to access the route even if it is part of group ', async () => {
        const incompleteData = { ...data[2] }
        delete incompleteData.category // remove the email field
        const res = await request(app)
            .post(`/api/groups/${group_id}/member/add`)
            .set('authorization', `Bearer ${non_verified_user_access_token}`)
            .send(incompleteData)
        expect(res.statusCode).toEqual(401)
    })
    // Test case for invalid email format
    it('should fail and return  un authorized access when access token not find or expired or invalid', async () => {
        const res = await request(app)
            .post(`/api/groups/${group_id}/member/add`)
            .send(groupFakeData())
        expect(res.statusCode).toEqual(401)
    })
    // Test case for user already registered
    it('should fail when member already present in  group  ', async () => {
        member = [user[0].dataValues.id]
        const res = await request(app)
            .post(`/api/groups/${group_id}/member/add`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
            .send({ member: [user[1].dataValues.id] })
        expect(res.statusCode).toEqual(409)
    })
})
// update group
describe('TEST PATCH api/groups/  update group API', () => {
    // Test case for successful user registration
    it('should update a group with correct data and current verified members', async () => {
        const response = await request(app)
            .patch(`/api/groups/${group_id}`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
            .send({ ...groupFakeData(), title: 'Flate Mates' })
        expect(response.statusCode).toEqual(200)
        expect(response.body.message).toEqual('Success')
    })
    // Test case for missing required fields
    it('should fail when required fields are missing', async () => {
        const incompleteData = { ...groupFakeData() }
        delete incompleteData.category // remove the email field
        const res = await request(app)
            .patch(`/api/groups/${'group_id'}`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
            .send(incompleteData)
        expect(res.statusCode).toEqual(400)
    })
    // Test case for invalid email format
    it('should fail and return 401 un authorized access user is not verified', async () => {
        const res = await request(app)
            .patch(`/api/groups/${group_id}`)
            .set('authorization', `Bearer ${non_verified_user_access_token}`)
            .send(group_data)
        expect(res.statusCode).toEqual(401)
    })

    it('should fail and return  un authorized access when user is not part of the group', async () => {
        const res = await request(app)
            .patch(`/api/groups/${group_id}`)
            .set('authorization', `Bearer ${non_member_token}`)
            .send(group_data)
        expect(res.statusCode).toEqual(403)
    })
    it('should fail and return group not found ', async () => {
        const res = await request(app)
            .patch('/api/groups/')
            .set('authorization', `Bearer ${user_not_found_access_token}`)
            .send(group_data)
        expect(res.statusCode).toEqual(404)
    })
})

// this is remove member
describe('TEST DELETE api/groups/id/member/remove/user_id   remove member in group API', () => {
    // Test case for successful user registration
    it('should return 401 if logined user part of the group but not verified ', async () => {
        const response = await request(app)
            .delete(`/api/groups/${group_id}/member/remove/${user[4].id}`)
            .set('authorization', `Bearer ${non_verified_user_access_token}`)
        console.log('THIS IS REMOVE TEST RESPONSE 401 => ', response.body)
        expect(response.statusCode).toEqual(401)
    })
    it('should fail when member having pending depts in group', async () => {
        const response = await request(app)
            .delete(
                `/api/groups/${expense_group_id}/member/remove/${user[1].id}`
            )
            .set('authorization', `Bearer ${verified_user_access_token}`)
        console.log('THIS IS REMOVE TEST RESPONSE 409 => ', response.body)
        expect(response.statusCode).toEqual(409)
    })
    it('should fail not valid group_id or user_id', async () => {
        const response = await request(app)
            .delete(`/api/groups/${'group_id'}/member/remove/${user[2].id}`)
            .set('authorization', `Bearer ${non_verified_user_access_token}`)
        console.log('THIS IS REMOVE TEST RESPONSE 400 => ', response.body)
        expect(response.statusCode).toEqual(400)
    })
    it('should remove user after all valid checks and condition fullfiled', async () => {
        const response = await request(app)
            .delete(`/api/groups/${group_id}/member/remove/${user[2].id}`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
        console.log('THIS IS REMOVE TEST RESPONSE => ', response.body)
        expect(response.statusCode).toEqual(200)
        expect(response.body.message).toEqual('Success')
        expect(response.body.data).toHaveProperty('member')
        expect(response.body.data).toHaveProperty('group')
        expect(response.body.data).toHaveProperty('removed_by')
    })
    it('should return 403 if logined user not part of the group  ', async () => {
        const response = await request(app)
            .delete(`/api/groups/${group_id}/member/remove/${user[4].id}`)
            .set('authorization', `Bearer ${non_verified_user_access_token}`)
        console.log('THIS IS REMOVE TEST RESPONSE 403 => ', response.body)
        expect(response.statusCode).toEqual(403)
    })
    it('should return 403 if try to remove admin  ', async () => {
        const response = await request(app)
            .delete(`/api/groups/${group_id}/member/remove/${user[0].id}`)
            .set('authorization', `Bearer ${non_verified_user_access_token}`)
        console.log('THIS IS REMOVE TEST RESPONSE 403 => ', response.body)
        expect(response.statusCode).toEqual(403)
    })
    it('should return 404 if user not present in the group', async () => {
        const response = await request(app)
            .delete(`/api/groups/${group_id}/member/remove/${user[4].id}`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
        console.log('THIS IS REMOVE TEST RESPONSE => ', response.body)
        expect(response.statusCode).toEqual(404)
    })
})

// this is delete group
describe('TEST DELETE api/groups/id/ delete group API', () => {
    // Test case for successful user registration
    it('should return 403 if logined user not admin of the group  ', async () => {
        const response = await request(app)
            .delete(`/api/groups/${group_id}`)
            .set('authorization', `Bearer ${non_verified_user_access_token}`)
        console.log('THIS IS REMOVE TEST RESPONSE 403 => ', response.body)
        expect(response.statusCode).toEqual(403)
    })
    it('should fail when group having pending depts in group', async () => {
        const response = await request(app)
            .delete(`/api/groups/${expense_group_id}`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
        console.log('THIS IS REMOVE TEST RESPONSE 409 => ', response.body)
        expect(response.statusCode).toEqual(409)
    })
    it('should fail not valid group_id ', async () => {
        const response = await request(app)
            .delete(`/api/groups/${'group_id'}`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
        console.log('THIS IS REMOVE TEST RESPONSE 400 => ', response.body)
        expect(response.statusCode).toEqual(400)
    })
    it('should delete group after all valid checks and condition fullfiled', async () => {
        const response = await request(app)
            .delete(`/api/groups/${group_id}`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
        console.log('THIS IS REMOVE TEST RESPONSE => ', response.body)
        expect(response.statusCode).toEqual(200)
        expect(response.body.message).toEqual('Success')
    })
    it('should return 404 if user not present in the group', async () => {
        const response = await request(app)
            .delete(`/api/groups/${group_id}`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
        console.log('THIS IS REMOVE TEST RESPONSE => ', response.body)
        expect(response.statusCode).toEqual(404)
    })
})

// add expense
describe('TEST POST api/groups/id/expenses add group expense API', () => {
    // Test case for successful user registration
    it('should return 200 add a group with correct data and if any payee not belongs to group than this expense added as non group ', async () => {
        const response = await request(app)
            .post(`/api/groups/${group_id}/expense/`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
            .send(expense_payload)
        console.log('THIS IS CREATE GROUP EXPENSE TEST  => ', response.body)
        expect(response.statusCode).toEqual(200)
        expect(response.body.message).toEqual('Success')
    })
    // // Test case for missing required field
    it('should fail and return 400 when required fields are missing', async () => {
        const response = await request(app)
            .post(`/api/groups/${group_id}/expense/`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
            .send({ ...expense_payload, member: [] })
        console.log('THIS IS CREATE GROUP EXPENSE TEST  => ', response.body)
        expect(response.statusCode).toEqual(400)
    })

    it('should fail and return 403 un authorized access user is not part of the group ', async () => {
        const response = await request(app)
            .post(`/api/groups/${group_id}/expense/`)
            .set('authorization', `Bearer ${non_member_token}`)
            .send({ ...expense_payload })
        console.log('THIS IS CREATE GROUP EXPENSE TEST  => ', response.body)
        expect(response.statusCode).toEqual(403)
    })

    it('should fail and return 401 un authorized access user not verified', async () => {
        const response = await request(app)
            .post(`/api/groups/${group_id}/expense/`)
            .set('authorization', `Bearer ${non_verified_user_access_token2}`)
            .send({ ...expense_payload })
        console.log('THIS IS CREATE GROUP EXPENSE TEST  => ', response.body)
        expect(response.statusCode).toEqual(401)
    })
    it('should fail and return 409 if base_amount and total amount of all the payee is not equal', async () => {
        let member = [...expense_payload.member]
        const response = await request(app)
            .post(`/api/groups/${group_id}/expense/`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
            .send({
                ...expense_payload,
                base_amount: 4000,
                member: [
                    { user_id: member[0].user_id, amount: 400 },
                    { user_id: member[1].user_id, amount: 1700 },
                ],
            })
        console.log('THIS IS CREATE GROUP EXPENSE TEST  => ', response.body)
        expect(response.statusCode).toEqual(409)
    })
})
// update expense
describe('TEST PUT api/groups/id/expense update group expense API', () => {
    // Test case for successful user registration
    it('should return 200 add a group with correct data and if any payee not belongs to group than this expense added as non group ', async () => {
        const response = await request(app)
            .put(`/api/groups/${group_id}/expense/`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
            .send({
                ...expense_payload,
                base_amount: 4000,
                expense_id: expense.data.expense.id,
                member: [
                    {
                        user_id: [expense_payload.member[0].user_id][0],
                        amount: 4000,
                    },
                    {
                        user_id: [expense_payload.member[1].user_id][0],
                        amount: 0,
                    },
                ],
            })
        console.log(
            'THIS IS CREATE GROUP EXPENSE TEST  UPDATED => ',
            response.body
        )
        expect(response.statusCode).toEqual(200)
        expect(response.body.message).toEqual('Success')

        // expect(response.body.data).toHaveProperty(group_id).toEqual(group_id)
    })
    // // Test case for missing required field
    it('should fail and return 400 when required fields are missing', async () => {
        const response = await request(app)
            .put(`/api/groups/${group_id}/expense/`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
            .send({
                ...expense_payload,
                member: [],
                expense_id: expense.data.expense.id,
            })
        console.log('THIS IS CREATE GROUP EXPENSE TEST  => ', response.body)
        expect(response.statusCode).toEqual(400)
    })

    it('should fail and return 403 un authorized access user is not part of the group ', async () => {
        const response = await request(app)
            .put(`/api/groups/${group_id}/expense/`)
            .set('authorization', `Bearer ${non_member_token}`)
            .send({ ...expense_payload, expense_id: expense.data.expense.id })
        console.log('THIS IS CREATE GROUP EXPENSE TEST  => ', response.body)
        expect(response.statusCode).toEqual(403)
    })

    it('should fail and return 401 un authorized access user not verified', async () => {
        const response = await request(app)
            .put(`/api/groups/${group_id}/expense/`)
            .set('authorization', `Bearer ${non_verified_user_access_token2}`)
            .send({ ...expense_payload, expense_id: expense.data.expense.id })
        console.log('THIS IS CREATE GROUP EXPENSE TEST  => ', response.body)
        expect(response.statusCode).toEqual(401)
    })
    it('should fail and return 404 if expense not found ', async () => {
        const response = await request(app)
            .put(`/api/groups/${group_id}/expense/`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
            .send({
                ...expense_payload,
                expense_id: [expense_payload.member[0].user_id][0],
            })
        console.log('THIS IS CREATE GROUP EXPENSE TEST  => ', response.body)
        expect(response.statusCode).toEqual(404)
    })
    it('should fail and return 409 if base_amount and total amount of all the payee is not equal', async () => {
        let member = [...expense_payload.member]
        const response = await request(app)
            .put(`/api/groups/${group_id}/expense/`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
            .send({
                ...expense_payload,
                expense_id: expense.data.expense.id,
                base_amount: 4000,
                member: [
                    { user_id: member[0].user_id, amount: 400 },
                    { user_id: member[1].user_id, amount: 1700 },
                ],
            })
        console.log('THIS IS CREATE GROUP EXPENSE TEST  => ', response.body)
        expect(response.statusCode).toEqual(409)
    })
})
describe('TEST DELETE api/groups/id/ delete group API', () => {
    // Test case for successful user registration
    it('should return 403 if logined user not admin of the group  ', async () => {
        const response = await request(app)
            .delete(
                `/api/groups/${group_id}/expense/${expense.data.expense.id}`
            )
            .set('authorization', `Bearer ${non_verified_user_access_token}`)
        console.log('THIS IS REMOVE TEST RESPONSE 403 => ', response.body)
        expect(response.statusCode).toEqual(403)
    })
    it('should fail when group having pending depts in expense', async () => {
        const response = await request(app)
            .delete(
                `/api/groups/${group_id}/expense/${expense.data.expense.id}`
            )
            .set('authorization', `Bearer ${verified_user_access_token}`)
        console.log('THIS IS REMOVE TEST RESPONSE 409 => ', response.body)
        expect(response.statusCode).toEqual(409)
    })
    it('should fail not valid group_id ', async () => {
        const response = await request(app)
            .delete(
                `/api/groups/${group_id}/expense/${expense.data.expense.id}`
            )
            .set('authorization', `Bearer ${verified_user_access_token}`)
        console.log('THIS IS REMOVE TEST RESPONSE 400 => ', response.body)
        expect(response.statusCode).toEqual(400)
    })
    it('should delete group after all valid checks and condition fullfiled', async () => {
        const response = await request(app)
            .delete(
                `/api/groups/${group_id}/expense/${expense.data.expense.id}`
            )
            .set('authorization', `Bearer ${verified_user_access_token}`)
        console.log('THIS IS REMOVE TEST RESPONSE => ', response.body)
        expect(response.statusCode).toEqual(200)
        expect(response.body.message).toEqual('Success')
    })
    it('should return 404 if user not present in the group', async () => {
        const response = await request(app)
            .delete(
                `/api/groups/${group_id}/expense/${expense.data.expense.id}`
            )
            .set('authorization', `Bearer ${verified_user_access_token}`)
        console.log('THIS IS REMOVE TEST RESPONSE => ', response.body)
        expect(response.statusCode).toEqual(404)
    })
})

afterAll(async () => {
    await User.truncate()
    await Group.truncate()
    await UserGroup.truncate()
})
