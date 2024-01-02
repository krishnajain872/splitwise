const request = require('supertest')
const { faker } = require('@faker-js/faker')
const app = require('../app')
const bcrypt = require('bcrypt')
const { User } = require('../models')
const { UserGroup } = require('../models')
const { Group } = require('../models')
const { Payee } = require('../models')
const { Transaction } = require('../models')
const { Expense } = require('../models')

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
let verified_user_access_token2
let non_member_token
let member
let currency
let expense
let share_expense_group_id
let expense_payload
let transaction_id
// let share_expense
// let share_expense_payload
beforeAll(async () => {
    await User.destroy({
        where: {},
        truncate: { cascade: true },
        force: true,
    })
    await UserGroup.destroy({
        where: {},
        truncate: { cascade: true },
        force: true,
    })
    await Group.destroy({
        where: {},
        truncate: { cascade: true },
        force: true,
    })
    await Expense.destroy({
        where: {},
        truncate: { cascade: true },
        force: true,
    })
    await Transaction.destroy({
        where: {},
        truncate: { cascade: true },
        force: true,
    })
    await Payee.destroy({
        where: {},
        truncate: { cascade: true },
        force: true,
    })
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
        {
            ...data[6],
            password,
        },
    ]

    user = await User.bulkCreate(payload)
    member = [
        user[1].dataValues.id, //verified
        user[2].dataValues.id, //non verified
        user[5].dataValues.id, //non verified
        user[6].dataValues.id,
    ]

    const verified_user_response = await request(app)
        .post('/api/auth/login')
        .send({ mobile: data[0].mobile, password: data[0].password }) //admin
    verified_user_access_token = verified_user_response.body.data.accessToken
    const verified_user_response2 = await request(app)
        .post('/api/auth/login')
        .send({ mobile: data[1].mobile, password: data[0].password }) //admin
    verified_user_access_token2 = verified_user_response2.body.data.accessToken
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
    currency = currency_response.body.data
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
                amount: 100,
            },
            {
                user_id: user[2].dataValues.id,
                amount: 100,
            },
            {
                user_id: user[6].dataValues.id,
                amount: 0,
            },
        ],
    }
    share_expense_payload = {
        ...expenseFakeData(),
        split_by: 'share',
        currency_id: currency[0].id,
        member: [
            {
                user_id: user[0].dataValues.id,
                amount: 2000,
                share: 2000,
            },
            {
                user_id: user[1].dataValues.id,
                amount: 0,
                share: 0,
            },
            {
                user_id: user[2].dataValues.id,
                amount: 0,
                share: 0,
            },
            {
                user_id: user[6].dataValues.id,
                amount: 0,
                share: 0,
            },
        ],
    }
    // create Group
    const group_response = await request(app)
        .post('/api/groups/')
        .set('authorization', `Bearer ${verified_user_access_token}`)
        .send(groupFakeData())
    expense_group_id = group_response.body.data.group.id
    const group_response2 = await request(app)
        .post('/api/groups/')
        .set('authorization', `Bearer ${verified_user_access_token}`)
        .send(groupFakeData())
    share_expense_group_id = group_response2.body.data.group.id

    const expense_response = await request(app)
        .post(`/api/groups/${expense_group_id}/expense/`)
        .set('authorization', `Bearer ${verified_user_access_token}`)
        .send(expense_payload)
    expense = expense_response.body
    console.log('THIS IS EXPENSE => haare krishna', expense)
    const share_expense_response = await request(app)
        .post(`/api/groups/${share_expense_group_id}/expense/`)
        .set('authorization', `Bearer ${verified_user_access_token}`)
        .send(expense_payload)
    share_expense = share_expense_response.body
    // create add member
    await request(app)
        .post(`/api/groups/${expense_group_id}/member/add`)
        .set('authorization', `Bearer ${verified_user_access_token}`)
        .send({ member: member })
    await request(app)
        .post(`/api/groups/${share_expense_group_id}/member/add`)
        .set('authorization', `Bearer ${verified_user_access_token}`)
        .send({ member: member })
    await User.destroy({
        where: {
            id: user[3].dataValues.id,
        },
    })
})
// create group
describe('TEST POST api/groups/ create group API', () => {
    // Test case for successful user registration
    it('should create a group with correct data and current login admin as user', async () => {
        const response = await request(app)
            .post('/api/groups/')
            .set('authorization', `Bearer ${verified_user_access_token}`)
            .send(groupFakeData())
        expect(response.statusCode).toEqual(200)
        expect(response.body.message).toEqual('Success')
        user_id = response.body.data.group.adminId
        group_id = response.body.data.group.id
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
    it('should fail and return user not found when access token of non existing user', async () => {
        const res = await request(app)
            .post('/api/groups/')
            .set('authorization', `Bearer ${user_not_found_access_token}`)
            .send(group_data)
        expect(res.statusCode).toEqual(404)
    })
})
// add members
describe('TEST POST api/groups/id/member/add add member in group API', () => {
    // Test case for successful user registration
    it('should create a group with correct data and current login admin as user', async () => {
        const response = await request(app)
            .post(`/api/groups/${group_id}/members/add`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
            .send({ members: member })
        expect(response.statusCode).toEqual(200)
        expect(response.body.message).toEqual('Success')
    })
    // Test case for missing required fields
    it('should fail when required fields are missing', async () => {
        const incompleteData = { ...data[2] }
        delete incompleteData.category // remove the email field
        const res = await request(app)
            .post(`/api/groups/${group_id}/members/add`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
            .send(incompleteData)

        expect(res.statusCode).toEqual(400)
    })

    // Test case for missing required fields
    it('should fail when a user non belongs to group try to access the add member route ', async () => {
        const incompleteData = { ...data[2] }
        delete incompleteData.category // remove the email field
        const res = await request(app)
            .post(`/api/groups/${group_id}/members/add`)
            .set('authorization', `Bearer ${non_member_token}`)
            .send(incompleteData)
        expect(res.statusCode).toEqual(403)
    })
    it('should fail when a user non verified tried to access the route even if it is part of group ', async () => {
        const incompleteData = { ...data[2] }
        delete incompleteData.category // remove the email field
        const res = await request(app)
            .post(`/api/groups/${group_id}/members/add`)
            .set('authorization', `Bearer ${non_verified_user_access_token}`)
            .send(incompleteData)
        expect(res.statusCode).toEqual(401)
    })

    it('should fail and return  un authorized access when access token not find or expired or invalid', async () => {
        const res = await request(app)
            .post(`/api/groups/${group_id}/members/add`)
            .send(groupFakeData())
        expect(res.statusCode).toEqual(401)
    })

    it('should fail when member already present in  group  ', async () => {
        member = [user[0].dataValues.id]
        const res = await request(app)
            .post(`/api/groups/${group_id}/members/add`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
            .send({ members: member })
        expect(res.statusCode).toEqual(409)
    })
    it('should fail when member id is invalid ', async () => {
        member = ['groupId']
        const res = await request(app)
            .post(`/api/groups/${group_id}/members/add`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
            .send({ members: member })
        expect(res.statusCode).toEqual(400)
    })
    it('should fail when member id is not found or not exis ', async () => {
        member = [group_id]
        const res = await request(app)
            .post(`/api/groups/${group_id}/members/add`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
            .send({ members: member })
        expect(res.statusCode).toEqual(404)
    })
})
// get all groups of current user
describe('TEST GET api/groups/ ', () => {
    it('should return 200  and all the groups of current login user ', async () => {
        const response = await request(app)
            .get('/api/groups/')
            .set('authorization', `Bearer ${verified_user_access_token}`)
        expect(response.statusCode).toBe(200)
    })
    it('should return 404 if the user does not exist', async () => {
        const response = await request(app)
            .get('/api/groups/')
            .set('authorization', `Bearer ${user_not_found_access_token}`)
        expect(response.statusCode).toBe(404)
    })
    it('should return 403 if the user is not verified or not valid member', async () => {
        const response = await request(app)
            .get('/api/groups/')
            .set('authorization', `Bearer ${non_verified_user_access_token}`)

        expect(response.statusCode).toBe(403)
    })
})
describe('TEST GET api/groups/members ', () => {
    it('should return 200 and all the members of current group', async () => {
        const response = await request(app)
            .get(`/api/groups/${expense_group_id}/members`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
        console.log({ 123: expense_group_id }, response.body.data)
        expect(response.statusCode).toBe(200)
    })
    it('should return 404 if the user does not exist', async () => {
        const response = await request(app)
            .get(`/api/groups/${expense_group_id}/members`)
            .set('authorization', `Bearer ${user_not_found_access_token}`)
        expect(response.statusCode).toBe(404)
    })
    it('should return 403 if the user is not verified or not valid group member', async () => {
        const response = await request(app)
            .get(`/api/groups/${expense_group_id}/members`)
            .set('authorization', `Bearer ${non_verified_user_access_token}`)
        expect(response.statusCode).toBe(403)
    })
})
// update group
describe('TEST PATCH api/groups/ update group API', () => {
    // Test case for successful user registration
    it('should 200 update a group with correct data and current verified members', async () => {
        const response = await request(app)
            .patch(`/api/groups/${group_id}`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
            .send({ ...groupFakeData(), title: 'Flate Mates' })
        expect(response.statusCode).toEqual(200)
        expect(response.body.message).toEqual('Success')
    })
    // Test case for missing required fields
    it('should 400 fail when required fields are missing', async () => {
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

    it('should 403 fail and return  un authorized access when user is not part of the group', async () => {
        const res = await request(app)
            .patch(`/api/groups/${group_id}`)
            .set('authorization', `Bearer ${non_member_token}`)
            .send(group_data)
        expect(res.statusCode).toEqual(403)
    })
    it('should fail and return when group not exist  ', async () => {
        const res = await request(app)
            .patch(`/api/groups/${user[4].id}`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
            .send(group_data)
        console.log({ 123: res.body })
        expect(res.statusCode).toEqual(404)
    })
})
// this is remove member
describe('TEST DELETE api/groups/id/member/remove/user_id remove member in group API', () => {
    // Test case for successful user registration
    it('should return 401 if logined user part of the group but not verified ', async () => {
        const response = await request(app)
            .delete(`/api/groups/${group_id}/member/remove/${user[4].id}`)
            .set('authorization', `Bearer ${non_verified_user_access_token}`)
        expect(response.statusCode).toEqual(401)
    })
    it('should send 409 and fail when member having pending depts in group', async () => {
        // `api/groups/${share_expense_group_id}/members/`
        await request(app)
            .post(`/api/groups/${expense_group_id}/members/add`)
            .send({ members: [`${user[2].id}`, `${user[1].id}`] })
            .set('authorization', `Bearer ${verified_user_access_token}`)
        await request(app)
            .post(`/api/groups/${expense_group_id}/expense/`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
            .send({
                ...expense_payload,
                member: [
                    { user_id: user[2].id, amount: 1900 },
                    { user_id: user[1].id, amount: 100 },
                ],
            })
        const response = await request(app)
            .delete(
                `/api/groups/${expense_group_id}/member/remove/${user[2].id}`
            )
            .set('authorization', `Bearer ${verified_user_access_token}`)
        expect(response.statusCode).toEqual(409)
    })
    it('should send 400 and fail not valid group_id or user_id', async () => {
        const response = await request(app)
            .delete(`/api/groups/${'group_id'}/member/remove/${user[2].id}`)
            .set('authorization', `Bearer ${non_verified_user_access_token}`)
        expect(response.statusCode).toEqual(400)
    })
    it('should send 400 and fail not valid group_id or user_id', async () => {
        const response = await request(app)
            .delete(`/api/groups/${group_id}/member/remove/${'user[2].id'}`)
            .set('authorization', `Bearer ${non_verified_user_access_token}`)
        expect(response.statusCode).toEqual(400)
    })
    it('should send 200 and remove user after all valid checks and condition fullfiled', async () => {
        const response = await request(app)
            .delete(`/api/groups/${group_id}/member/remove/${user[2].id}`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
        expect(response.statusCode).toEqual(200)
        expect(response.body.message).toEqual('Success')
    })
    it('should return 403 if logined user not part of the group  ', async () => {
        const response = await request(app)
            .delete(`/api/groups/${group_id}/member/remove/${user[4].id}`)
            .set('authorization', `Bearer ${non_verified_user_access_token}`)

        expect(response.statusCode).toEqual(403)
    })
    it('should return 403 if try to remove admin  ', async () => {
        const response = await request(app)
            .delete(`/api/groups/${group_id}/member/remove/${user[0].id}`)
            .set('authorization', `Bearer ${verified_user_access_token}`)

        expect(response.statusCode).toEqual(403)
    })
    it('should return 404 if user not present in the group', async () => {
        const response = await request(app)
            .delete(`/api/groups/${group_id}/member/remove/${user[4].id}`)
            .set('authorization', `Bearer ${verified_user_access_token}`)

        expect(response.statusCode).toEqual(404)
    })
    it('should return 404 if user not present in the group', async () => {
        const response = await request(app)
            .delete(`/api/groups/${group_id}/member/remove/${group_id}`)
            .set('authorization', `Bearer ${verified_user_access_token}`)

        expect(response.statusCode).toEqual(404)
    })
})
// settle-up group  expenses
describe('TEST GET api/groups/:group_id/expense/:expense_id/transactions/settle-up/', () => {
    it('should return 200 and all the members of current group', async () => {
        const response = await request(app)
            .get(
                `/api/groups/${group_id}/expense/${expense.data.expense.id}/transactions/settle-up/`
            )
            .set('authorization', `Bearer ${verified_user_access_token}`)
        transaction_id = response.body
        expect(response.statusCode).toBe(200)
    })
    it('should return 404 if the group does not exist', async () => {
        const response = await request(app)
            .get(
                `/api/groups/${expense_group_id}/expense/${expense.data.expense.id}/transactions/settle-up/`
            )
            .set('authorization', `Bearer ${user_not_found_access_token}`)
        expect(response.statusCode).toBe(404)
    })
    it('should return 404 if the expense does not exist', async () => {
        const response = await request(app)
            .get(
                `/api/groups/${expense_group_id}/expense/${expense_group_id}/transactions/settle-up/`
            )
            .set('authorization', `Bearer ${verified_user_access_token}`)

        expect(response.statusCode).toBe(404)
    })
    it('should return 403 if the if not the admin ', async () => {
        const response = await request(app)
            .get(
                `/api/groups/${expense_group_id}/expense/${expense.data.expense.id}/transactions/settle-up/`
            )
            .set('authorization', `Bearer ${non_verified_user_access_token}`)
        expect(response.statusCode).toBe(403)
    })
})
// settle-up transaction
describe('TEST GET api/users/expense/:expense_id/transaction/:transaction_id/settle-up/', () => {
    it('should return 200 and all the members of current group', async () => {
        const response = await request(app)
            .get(
                `/api/users/expense/${share_expense.data.expense.id}/transaction/${transaction_id.data[0].transaction.id}/settle-up/`
            )
            .set('authorization', `Bearer ${verified_user_access_token}`)
        console.log('THIS IS RESPONSE123 ==> ', response.body)
        expect(response.statusCode).toBe(200)
    })
    it('should return 404 if the expense does not exist', async () => {
        const response = await request(app)
            .get(
                `/api/users/expense/${transaction_id.data[0].id}/transaction/${transaction_id.data[0].id}/settle-up/`
            )
            .set('authorization', `Bearer ${verified_user_access_token}`)

        expect(response.statusCode).toBe(404)
    })
    it('should return 404 if the transaction does not exist', async () => {
        const response = await request(app)
            .get(
                `/api/users/expense/${expense.data.expense.id}/transaction/${expense.data.expense.id}/settle-up/`
            )
            .set('authorization', `Bearer ${verified_user_access_token}`)

        expect(response.statusCode).toBe(404)
    })
    it('should return 403 if the if user is not the part of expense ', async () => {
        const response = await request(app)
            .get(
                `/api/users/expense/${expense.data.expense.id}/transaction/${transaction_id.data[0].transaction.id}/settle-up/`
            )
            .set('authorization', `Bearer ${non_verified_user_access_token2}`)

        expect(response.statusCode).toBe(403)
    })
    it('should return 403 if the if user is not the part of transaction ', async () => {
        const response = await request(app)
            .get(
                `/api/users/expense/${share_expense.data.expense.id}/transaction/${transaction_id.data[2].transaction.id}/settle-up/`
            )
            .set('authorization', `Bearer ${verified_user_access_token2}`)
        console.log({ THII: response.body })
        expect(response.statusCode).toBe(403)
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
        expect(response.statusCode).toEqual(200)
        expect(response.body.message).toEqual('Success')
    })
    // // Test case for missing required field
    it('should fail and return 400 when required fields are missing', async () => {
        const response = await request(app)
            .post(`/api/groups/${group_id}/expense/`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
            .send({ ...expense_payload, member: [] })
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
            .put(`/api/groups/${group_id}/expense/${expense.data.expense.id}`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
            .send({
                ...expense_payload,
                base_amount: 4000,
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
            .put(`/api/groups/${group_id}/expense/${expense.data.expense.id}`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
            .send({
                ...expense_payload,
                member: [],
            })
        console.log('THIS IS CREATE GROUP EXPENSE TEST  => ', response.body)
        expect(response.statusCode).toEqual(400)
    })

    it('should fail and return 403 un authorized access user is not part of the group ', async () => {
        const response = await request(app)
            .put(`/api/groups/${group_id}/expense/${expense.data.expense.id}`)
            .set('authorization', `Bearer ${non_member_token}`)
            .send({ ...expense_payload })
        console.log('THIS IS CREATE GROUP EXPENSE TEST  => ', response.body)
        expect(response.statusCode).toEqual(403)
    })

    it('should fail and return 401 un authorized access user not verified', async () => {
        const response = await request(app)
            .put(`/api/groups/${group_id}/expense/${expense.data.expense.id}`)
            .set('authorization', `Bearer ${non_verified_user_access_token2}`)
            .send({ ...expense_payload })
        console.log('THIS IS CREATE GROUP EXPENSE TEST  => ', response.body)
        expect(response.statusCode).toEqual(401)
    })
    it('should fail and return 404 if expense not found ', async () => {
        const response = await request(app)
            .put(`/api/groups/${group_id}/expense/${group_id}`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
            .send({
                ...expense_payload,
            })
        console.log('THIS IS CREATE GROUP EXPENSE TEST  => ', response.body)
        expect(response.statusCode).toEqual(404)
    })
    it('should fail and return 409 if base_amount and total amount of all the payee is not equal', async () => {
        let member = [...expense_payload.member]
        const response = await request(app)
            .put(`/api/groups/${group_id}/expense/${expense.data.expense.id}`)
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
// get all of the current member expenses
describe('TEST GET api/groups/:group_id/expenses/ ', () => {
    it('should return 200 and all the members of current group', async () => {
        const response = await request(app)
            .get(`/api/groups/${expense_group_id}/expenses/`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
        expect(response.statusCode).toBe(200)
    })
    it('should return 404 if the user does not exist', async () => {
        const response = await request(app)
            .get(`/api/groups/${expense_group_id}/expenses/`)
            .set('authorization', `Bearer ${user_not_found_access_token}`)

        expect(response.statusCode).toBe(404)
    })
    it('should return 403 if the user is not verified or not valid group member', async () => {
        const response = await request(app)
            .get(`/api/groups/${expense_group_id}/expenses/`)
            .set('authorization', `Bearer ${non_member_token}`)

        expect(response.statusCode).toBe(403)
    })
})
// get pending expense of a group
describe('TEST GET api/groups/:group_id/member/expenses/pending/ ', () => {
    it('should return 200 and all the members of current group', async () => {
        const response = await request(app)
            .get(`/api/groups/${expense_group_id}/member/expenses/pending/`)
            .set('authorization', `Bearer ${verified_user_access_token}`)

        expect(response.statusCode).toBe(200)
    })
    it('should return 404 if the group does not exist', async () => {
        const response = await request(app)
            .get(`/api/groups/${expense_group_id}/member/expenses/pending/`)
            .set('authorization', `Bearer ${user_not_found_access_token}`)

        expect(response.statusCode).toBe(404)
    })
    it('should return 403 if the user is not verified or not valid group member', async () => {
        const response = await request(app)
            .get(`/api/groups/${expense_group_id}/member/expenses/pending/`)
            .set('authorization', `Bearer ${non_verified_user_access_token2}`)

        expect(response.statusCode).toBe(403)
    })
})
// get all pending expense of a group
describe('TEST GET api/groups/:group_id/expenses/pending/ ', () => {
    it('should return 200 and all the members of current group', async () => {
        const response = await request(app)
            .get(`/api/groups/${expense_group_id}/expenses/pending/`)
            .set('authorization', `Bearer ${verified_user_access_token}`)

        expect(response.statusCode).toBe(200)
    })
    it('should return 404 if the group does not exist', async () => {
        const response = await request(app)
            .get(`/api/groups/${expense_group_id}/expenses/pending/`)
            .set('authorization', `Bearer ${user_not_found_access_token}`)

        expect(response.statusCode).toBe(404)
    })
    it('should return 403 if the user is not verified or not valid group member', async () => {
        const response = await request(app)
            .get(`/api/groups/${expense_group_id}/expenses/`)
            .set('authorization', `Bearer ${non_verified_user_access_token2}`)

        expect(response.statusCode).toBe(403)
    })
})
// get all group expense of a user
describe('TEST GET api/groups/:group_id/expenses/pending/ ', () => {
    it('should return 200 and all the members of current group', async () => {
        const response = await request(app)
            .get(`/api/groups/${expense_group_id}/member/expenses/`)
            .set('authorization', `Bearer ${verified_user_access_token}`)

        expect(response.statusCode).toBe(200)
    })
    it('should return 404 if the group does not exist', async () => {
        const response = await request(app)
            .get(`/api/groups/${expense_group_id}/member/expenses/`)
            .set('authorization', `Bearer ${user_not_found_access_token}`)

        expect(response.statusCode).toBe(404)
    })
    it('should return 403 if the user is not verified or not valid group member', async () => {
        const response = await request(app)
            .get(`/api/groups/${expense_group_id}/member/expenses/`)
            .set('authorization', `Bearer ${non_verified_user_access_token2}`)

        expect(response.statusCode).toBe(403)
    })
})
// delete expense
describe('TEST DELETE api/groups/:id/expense/:expense_id delete expense API', () => {
    // Test case for successful user registration
    it('should send 409 and fail when group having pending depts in expense', async () => {
        await request(app).get(`/api/groups/expense/${expense_group_id}/`)
        const response = await request(app)
            .delete(
                `/api/groups/${expense_group_id}/expense/${expense.data.expense.id}`
            )
            .set('authorization', `Bearer ${verified_user_access_token}`)

        expect(response.statusCode).toEqual(409)
    })
    it('should return 403 if logined user not admin of the group  ', async () => {
        const response = await request(app)
            .delete(
                `/api/groups/${expense_group_id}/expense/${expense.data.expense.id}`
            )
            .set('authorization', `Bearer ${non_verified_user_access_token2}`)

        expect(response.statusCode).toEqual(403)
    })
    it('should send 400 and fail if not valid group_id ', async () => {
        // const settel = await request(app)
        //     .get(
        //         `/api/groups/${expense_group_id}/expense/${expense.data.expense.id}/transactions/settle-up`
        //     )
        //     .set('authorization', `Bearer ${verified_user_access_token}`)
        const response = await request(app)
            .delete(`/api/groups/${expense_group_id}/expense/${'expense_id'}`)
            .set('authorization', `Bearer ${verified_user_access_token}`)

        expect(response.statusCode).toEqual(400)
    })

    it('should send 200 and  delete group after all valid checks and condition fullfiled', async () => {
        await request(app)
            .get(
                `/api/groups/${share_expense_group_id}/expense/${share_expense.data.expense.id}/transactions/settle-up`
            )
            .set('authorization', `Bearer ${verified_user_access_token}`)
        const response = await request(app)
            .delete(
                `/api/groups/${share_expense_group_id}/expense/${share_expense.data.expense.id}`
            )
            .set('authorization', `Bearer ${verified_user_access_token}`)

        expect(response.statusCode).toEqual(200)
        expect(response.body.message).toEqual('Success')
    })
    it('should return 403 if user not present in the group', async () => {
        const response = await request(app)
            .delete(
                `/api/groups/${expense_group_id}/expense/${expense.data.expense.id}`
            )
            .set('authorization', `Bearer ${non_member_token}`)

        expect(response.statusCode).toEqual(403)
    })
})
describe(' TEST GET api/groups/groupid/member/expense/amount/', () => {
    it('should return total amount owed by current user for a particular group', async () => {
        const res = await request(app)
            .get(`/api/groups/${expense_group_id}/member/expense/amount`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
        expect(res.statusCode).toEqual(200)
    })
    it('should return 404 if group not found', async () => {
        const res = await request(app)
            .get(
                `/api/groups/${'7982fb36-5353-485f-806d-89f2eda69b5c'}/member/expense/amount`
            )
            .set('authorization', `Bearer ${verified_user_access_token}`)
        expect(res.statusCode).toEqual(404)
    })
})
describe(' TEST GET /  health check, ()', () => {
    it('/', async () => {
        const res = await request(app).get(`/`)
        expect(res.statusCode).toEqual(200)
    })
    it('/health', async () => {
        const res = await request(app).get(`/health`)
        expect(res.statusCode).toEqual(200)
    })
})
// this is delete group
describe('TEST DELETE api/groups/id/ delete group API', () => {
    it('should return 403 if logined user not admin of the group  ', async () => {
        const response = await request(app)
            .delete(`/api/groups/${expense_group_id}`)
            .set('authorization', `Bearer ${non_verified_user_access_token}`)

        expect(response.statusCode).toEqual(403)
    })
    it('should return 409 fail when group having pending depts in group', async () => {
        const response = await request(app)
            .delete(`/api/groups/${expense_group_id}`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
        expect(response.statusCode).toEqual(409)
    })
    it('should 400 fail not valid group_id ', async () => {
        await request(app)
            .get(
                `/api/groups/${group_id}/expense/${expense.data.expense.id}/transactions/settle-up`
            )
            .set('authorization', `Bearer ${verified_user_access_token}`)
        const response = await request(app)
            .delete(`/api/groups/${'group_id'}`)
            .set('authorization', `Bearer ${verified_user_access_token}`)

        expect(response.statusCode).toEqual(400)
    })
    it('should 404 if no transaction of expense found', async () => {
        const response = await request(app)
            .get(
                `/api/groups/${group_id}/expense/${expense.data.expense.id}/transactions/settle-up`
            )
            .set('authorization', `Bearer ${verified_user_access_token}`)

        expect(response.statusCode).toEqual(404)
    })
    it('should 200 delete group after all valid checks and condition fullfiled', async () => {
        const response = await request(app)
            .delete(`/api/groups/${group_id}`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
        expect(response.statusCode).toEqual(200)
        expect(response.body.message).toEqual('Success')
    })

    it('should return 404 if user not present in the group', async () => {
        const response = await request(app)
            .delete(`/api/groups/${group_id}`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
        expect(response.statusCode).toEqual(404)
    })
})
afterAll(async () => {
    await User.destroy({
        where: {},
        truncate: { cascade: true },
        force: true,
    })
    await UserGroup.destroy({
        where: {},
        truncate: { cascade: true },
        force: true,
    })
    await Group.destroy({
        where: {},
        truncate: { cascade: true },
        force: true,
    })
    await Expense.destroy({
        where: {},
        truncate: { cascade: true },
        force: true,
    })
    await Transaction.destroy({
        where: {},
        truncate: { cascade: true },
        force: true,
    })
    await Payee.destroy({
        where: {},
        truncate: { cascade: true },
        force: true,
    })
})
