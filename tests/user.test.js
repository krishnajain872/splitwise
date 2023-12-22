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

const mail = require('../helpers/mail.helper')
// user payload

// Function to generate fake user data
const generateFakeUserData = () => {
    return {
        first_name: faker.internet.userName(),
        last_name: faker.internet.userName(),
        email: process.env.RECEIVER_EMAIL,
        avatar: faker.image.avatar(),
        password: faker.internet.password(),
        mobile: String(faker.number.int({ min: 1000000000, max: 9999999999 })),
    }
}

// Available categories for groups
const categories = ['trip', 'home', 'couple', 'other', 'foodie']
const selectedCategory =
    categories[Math.floor(Math.random() * categories.length)]

// Function to generate fake group data
const generateFakeGroupData = () => {
    return {
        title: faker.person.fullName(),
        display_picture: faker.image.avatar(),
        category: selectedCategory,
    }
}

// Available expense categories
const expenseCategories = ['transport', 'food', 'game', 'other']
const selectedExpenseCategory =
    expenseCategories[Math.floor(Math.random() * expenseCategories.length)]

// Splitting options for expenses
const splitBy = ['equal', 'share']
const selectedSplit = splitBy[Math.floor(Math.random() * splitBy.length)]

// Function to generate fake expense data
const generateFakeExpenseData = () => {
    return {
        description: faker.lorem.lines(1),
        base_amount: 2000,
        category: selectedExpenseCategory,
        split_by: selectedSplit,
    }
}

// Generate fake user data for testing
const fakeUserData = faker.helpers.multiple(generateFakeUserData, {
    count: 10,
})

// Variables for testing purposes
let users
// let groupId
let expenseGroupId
let nonVerifiedUserAccessToken
// let nonVerifiedUserToken
let nonVerifiedUserAccessToken2
let verifiedUserAccessToken
let userNotFoundAccessToken
let userNotFoundToken
// let nonMemberToken
// let members
let currencyData
// let createdExpense
let expensePayload
let accessToken
let refreshToken
let hashedPassword
let token
// let expired_refresh_token =
//     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZTM0MzBmNTMtZDQ1NS00NzdhLThkOGItMGZhNTFjNzZlMTQ0IiwiaWF0IjoxNzAzMDY5OTY4LCJleHAiOjE3MDMxNTYzNjh9.gXSlvwXf6yv934K2BMXcAr2rfDmJsmN084Qo8350iDQ'
let expiredToken =
    'aea430dea2094d3a8603646d65b4e5ff:9f5b86ab64fdee8618e5e2e9ee88bb943908e2114536e2238ba60dd3e907ad29b3b4b24d14a2829d0a63a1495c9dde66,28384499'
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
    hashedPassword = await bcrypt.hash(fakeUserData[0].password, 10)
    const usersPayload = [
        {
            ...fakeUserData[0], // Admin user
            password: hashedPassword,
            status: 'verified',
        },
        {
            ...fakeUserData[1],
            status: 'verified',
            password: hashedPassword,
        },
        {
            ...fakeUserData[2],
            password: hashedPassword,
        },
        {
            ...fakeUserData[3],
            password: hashedPassword,
        },
        {
            ...fakeUserData[4],
            password: hashedPassword,
        },
        {
            ...fakeUserData[5],
            password: hashedPassword,
        },
        {
            ...fakeUserData[6],
            password: hashedPassword,
        },
    ]

    users = await User.bulkCreate(usersPayload)
    members = [
        users[1].dataValues.id, // Verified user
        users[2].dataValues.id, // Non-verified user
        users[3].dataValues.id, // Non-verified user
        users[4].dataValues.id, // Non-verified user
        users[5].dataValues.id, // Non-verified user
    ]

    // Login as a verified user
    const verifiedUserResponse = await request(app)
        .post('/api/auth/login')
        .send({
            mobile: fakeUserData[0].mobile,
            password: fakeUserData[0].password,
        })
    verifiedUserAccessToken = verifiedUserResponse.body.data.accessToken

    // Login as a nonVerifiedUserAccessToken user
    const nonVerifiedUserAccessTokenResponse = await request(app)
        .post('/api/auth/login')
        .send({
            mobile: fakeUserData[5].mobile,
            password: fakeUserData[0].password,
        })
    nonVerifiedUserAccessToken =
        nonVerifiedUserAccessTokenResponse.body.data.accessToken
    const nonVerifiedUserAccessTokenResponse2 = await request(app)
        .post('/api/auth/login')
        .send({
            mobile: fakeUserData[6].mobile,
            password: fakeUserData[0].password,
        })
    nonVerifiedUserAccessToken2 =
        nonVerifiedUserAccessTokenResponse2.body.data.accessToken

    // Login as a userNotFoundAccessToken user
    const userNotFoundAccessTokenResponse = await request(app)
        .post('/api/auth/login')
        .send({
            mobile: fakeUserData[3].mobile,
            password: fakeUserData[0].password,
        })
    userNotFoundAccessToken =
        userNotFoundAccessTokenResponse.body.data.accessToken
    // verify not found user
    const userNotFoundTokenResponse = await request(app)
        .get('/api/auth/send-verification')
        .set('authorization', `Bearer ${userNotFoundAccessToken}`)
    userNotFoundToken = userNotFoundTokenResponse.body.data.token

    // Fetch currency data
    const currencyResponse = await request(app)
        .get('/api/currencies')
        .set('authorization', `Bearer ${verifiedUserAccessToken}`)
    currencyData = currencyResponse.body

    // Prepare expense payload
    expensePayload = {
        ...generateFakeExpenseData(),
        base_amount: 4000,
        split_by: 'equal',
        currency_id: currencyData[0].id,
        member: [
            {
                user_id: users[0].dataValues.id,
                amount: 2000,
            },
            {
                user_id: users[1].dataValues.id,
                amount: 2000,
            },
        ],
    }

    // Create a Group
    const groupResponse = await request(app)
        .post('/api/groups/')
        .set('authorization', `Bearer ${verifiedUserAccessToken}`)
        .send(generateFakeGroupData())
    expenseGroupId = groupResponse.body.data.id

    // Add members to the expense group
    // const addMembersResponse = await request(app)
    //     .post(`/api/groups/${expenseGroupId}/members/add`)
    //     .set('authorization', `Bearer ${verifiedUserAccessToken}`)
    //     .send({ members })

    // Create an expense within the group
    const expenseResponse = await request(app)
        .post(`/api/groups/${expenseGroupId}/expense/`)
        .set('authorization', `Bearer ${verifiedUserAccessToken}`)
        .send(expensePayload)
    createdExpense = expenseResponse.body

    // Delete a user
    await User.destroy({
        where: {
            id: users[3].dataValues.id,
        },
    })
})

describe('TEST POST api/auth/signup', () => {
    // Successful user registration
    it('should sign in a user with correct data', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send(fakeUserData[9])
        expect(res.body.message).toEqual('Success')
        expect(res.statusCode).toEqual(200)
        expect(res.body.data.accessToken).toBeDefined()
        expect(res.body.data.status).toEqual('dummy')
        user_id = res.body.data.id
    })

    // Missing required fields
    it('should fail when required fields are missing', async () => {
        const incompleteData = { ...fakeUserData[9] }
        delete incompleteData.email
        const res = await request(app)
            .post('/api/auth/signup')
            .send(incompleteData)
        expect(res.statusCode).toEqual(400)
    })

    // Invalid email format
    it('should fail when email format is invalid', async () => {
        const invalidEmailData = { ...fakeUserData[9], email: 'invalidEmail' }
        const res = await request(app)
            .post('/api/auth/signup')
            .send(invalidEmailData)
        expect(res.statusCode).toEqual(400)
    })

    // Invalid mobile format
    it('should fail when mobile format is invalid', async () => {
        const invalidMobileData = { ...fakeUserData[9], mobile: '12345678901' }
        const res = await request(app)
            .post('/api/auth/signup')
            .send(invalidMobileData)
        expect(res.statusCode).toEqual(400)
    })

    // User already registered
    it('should fail when user is already registered', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send(fakeUserData[9])
        expect(res.statusCode).toEqual(409)
    })
})

describe('TEST POST api/auth/login', () => {
    it('should log in a user with correct data', async () => {
        const res = await request(app).post('/api/auth/login').send({
            mobile: fakeUserData[0].mobile,
            password: fakeUserData[0].password,
        })
        expect(res.statusCode).toEqual(200)
        accessToken = res.body.data.accessToken
        refreshToken = res.body.data.refresh_token
    })

    it('should fail when required fields are missing', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ mobile: fakeUserData[2].mobile }) // password is missing
        expect(res.statusCode).toEqual(400)
    })

    it('should fail when mobile number is invalid', async () => {
        const res = await request(app).post('/api/auth/login').send({
            mobile: 'invalidMobile',
            password: fakeUserData[2].password,
        })
        expect(res.statusCode).toEqual(400)
    })

    it('should fail when user is not found', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ mobile: '9999999999', password: fakeUserData[2].password }) // this mobile number does not exist
        expect(res.statusCode).toEqual(404)
    })

    it('should fail when password is incorrect', async () => {
        const res = await request(app).post('/api/auth/login').send({
            mobile: fakeUserData[2].mobile,
            password: 'incorrectPassword',
        })
        expect(res.statusCode).toEqual(401)
    })
})

describe('TEST POST api/auth/access-token', () => {
    it('should generate a new access token with valid refresh token', async () => {
        const res = await request(app)
            .post('/api/auth/access-token')
            .send({ refresh_token: refreshToken })
        expect(res.body.message).toEqual('Success')
        expect(res.statusCode).toEqual(200)
        expect(res.body.data.accessToken).toBeDefined()
        expect(res.body.data.refresh_token).toBeDefined()
    })

    it('should fail when refresh token is not valid or expired', async () => {
        const invalidRefreshToken = expiredToken
        const res = await request(app)
            .post('/api/auth/access-token')
            .send({ refresh_token: invalidRefreshToken })
        expect(res.statusCode).toEqual(401)
    })
})

describe('TEST get api/auth/send-verification', () => {
    // Test case for successful verification link generation
    it('should generate a verification link for a valid user => 200', async () => {
        const res = await request(app)
            .get('/api/auth/send-verification')
            .set('authorization', `Bearer ${nonVerifiedUserAccessToken}`)
        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('data.token')
        expect(res.body).toHaveProperty('data.status', 'unVerified')
        expect(res.body).toHaveProperty('message', 'Success')
        token = res.body.data.token
    })

    // Test case for user not found
    it('should fail when user is not found', async () => {
        const res = await request(app)
            .get('/api/auth/send-verification')
            .set('authorization', `Bearer ${userNotFoundAccessToken}`)
        expect(res.statusCode).toEqual(404)
        // Add more assertions here to check the response body
    })
    // Test case for unAuthorized access to the route
    it('should fail when  unAuthorized access', async () => {
        const res = await request(app).get('/api/auth/send-verification')
        expect(res.statusCode).toEqual(401)
        // Add more assertions here to check the response body
    })

    // Test case for user already verified
    it('should fail when user is already verified', async () => {
        const res = await request(app)
            .get('/api/auth/send-verification')
            .set('authorization', `Bearer ${accessToken}`)
        expect(res.statusCode).toEqual(409)
        // Add more assertions here to check the response body
    })
    it('should handle mail sending failure when verifying user', async () => {
        // Mock the sendMail function to return a specific error
        const error = new Error(
            'Verification email could not be sent due to a temporary network issue.'
        )
        error.statusCode = 422
        jest.spyOn(mail, 'sendMail').mockImplementation(() =>
            Promise.reject(error)
        )
        // Send the verification request with expected headers and body
        const res = await request(app)
            .get('/api/auth/send-verification')
            .set('authorization', `Bearer ${nonVerifiedUserAccessToken2}`)
        // Expect a 422 status code
        expect(res.body.statusCode).toEqual(422)
        // Assert on the error message in the response body
        expect(res.body.message).toEqual(
            'Verification email could not be sent due to a temporary network issue.'
        )
        // Restore the original implementation of sendMail
        jest.spyOn(mail, 'sendMail').mockRestore()
    })
})
describe('TEST get api/auth/verify', () => {
    // Test case for successful verification
    it('should accept a valid token and verify the user', async () => {
        const res = await request(app)
            .get(`/api/auth/verify/${token}`)
            .set('authorization', `Bearer ${nonVerifiedUserAccessToken}`)
        console.log('THIS IS RESPONSE==> of verify ==> ', res.body)
        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('data.id')
        expect(res.body).toHaveProperty('data.status', 'verified')
        expect(res.body).toHaveProperty('message', 'Success')
    })
    it('should reject an exprired or invalid ', async () => {
        const res = await request(app)
            .get(`/api/auth/verify/${expiredToken}`)
            .set('authorization', `Bearer ${accessToken}`)
        expect(res.statusCode).toEqual(401)
    })
    it('should response 404 if user not found ', async () => {
        const res = await request(app)
            .get(`/api/auth/verify/${expiredToken}`)
            .set('authorization', `Bearer ${userNotFoundAccessToken}`)

        expect(res.statusCode).toEqual(404)
    })
    it('should reject an invalid format token in the path', async () => {
        const res = await request(app)
            .get('/api/auth/verify/not_a_token')
            .set('authorization', `Bearer ${accessToken}`)
        expect(res.statusCode).toEqual(400)
    })
})

describe('TEST post api/auth/forget-password', () => {
    // Test case for successful verification link generation
    it('should generate a forget password link for a valid user', async () => {
        const res = await request(app).post('/api/auth/forget-password').send({
            mobile: fakeUserData[4].mobile,
        })
        console.log({ res: res.body })
        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('data.token')
        expect(res.body).toHaveProperty('message', 'Success')
        token = res.body.data.token
    })

    // Test case for user not found
    it('should fail when user is not found', async () => {
        const res = await request(app).post('/api/auth/forget-password').send({
            mobile: '5555555555',
        })
        expect(res.statusCode).toEqual(404)
        // Add more assertions here to check the response body
    })
    it('should reject an invalid mobile number in the payload', async () => {
        const res = await request(app).post('/api/auth/forget-password').send({
            mobile: '12345678901',
        })
        expect(res.statusCode).toEqual(400)
    })

    it('should handle mail sending failure when verifying user', async () => {
        // Mock the sendMail function to return a specific error
        const error = new Error(
            'Verification email could not be sent due to a temporary network issue.'
        )
        error.statusCode = 422
        jest.spyOn(mail, 'sendMail').mockImplementation(() =>
            Promise.reject(error)
        )

        // Send the verification request with expected headers and body
        const res = await request(app)
            .post('/api/auth/forget-password')
            .set('authorization', `Bearer ${accessToken}`)
            .send({
                mobile: fakeUserData[4].mobile,
            })
        // Expect a 422 status code
        expect(res.body.statusCode).toEqual(422)
        console.log('THIS IS FROM MAIL TESTER ===> ', res.body)
        // Assert on the error message in the response body
        expect(res.body.message).toEqual(
            'Verification email could not be sent due to a temporary network issue.'
        )
        // Restore the original implementation of sendMail
        jest.spyOn(mail, 'sendMail').mockRestore()
    })
})

describe('TEST POST api/reset-password  ', () => {
    it('should return 401 if the token is invalidor expired', async () => {
        const response = await request(app)
            .post('/api/auth/reset-password')
            .send({
                token: '510cf1718890ce023fbab1a32d265527:bc3e40e3967a8d2cafe9b3aa7755aef9b66b39e1cf220ba36cd680f86e7c2bfb26004c98a32166bd6a6c4c25b3c876fb,28381879',
                password: 'newPassword',
            })
        expect(response.statusCode).toBe(401)
    })
    it('should return 404 if the user does not exist', async () => {
        const response = await request(app)
            .post('/api/auth/reset-password')
            .send({
                token: userNotFoundToken,
                password: 'newPassword',
            })
        expect(response.statusCode).toBe(404)
    })
    it('should return 400 if the user does not exist', async () => {
        const response = await request(app)
            .post('/api/auth/reset-password')
            .send({
                token: 'user_not_found_token',
            })
        expect(response.statusCode).toBe(400)
    })
    it('should return the user data if the password is successfully updated', async () => {
        const response = await request(app)
            .post('/api/auth/reset-password')
            .send({ token: token, password: 'newPassword' })
        expect(response.statusCode).toBe(200)
        expect(response.body.data).toHaveProperty('first_name')
        expect(response.body.data).toHaveProperty('last_name')
        expect(response.body.data).toHaveProperty('id')
        expect(response.body.data).toHaveProperty('mobile')
        expect(response.body.data).toHaveProperty('email')
    })
})

describe('TEST GET api/users/all', () => {
    it('should return 200 if the logined user is verified it return all splitwise users', async () => {
        const response = await request(app)
            .get('/api/users/all')
            .set('authorization', `Bearer ${verifiedUserAccessToken}`)
        expect(response.statusCode).toBe(200)
    })
    it('should return 404 if the user does not exist', async () => {
        const response = await request(app)
            .get('/api/users/all')
            .set('authorization', `Bearer ${userNotFoundAccessToken}`)
        expect(response.statusCode).toBe(404)
    })
    it('should return 401 if the user is not verified', async () => {
        const response = await request(app)
            .get('/api/users/all')
            .set('authorization', `Bearer ${nonVerifiedUserAccessToken2}`)
        expect(response.statusCode).toBe(403)
    })
})

describe('TEST GET api/users/ ', () => {
    it('should return 200 if the logined user ', async () => {
        const response = await request(app)
            .get('/api/users/')
            .set('authorization', `Bearer ${verifiedUserAccessToken}`)
        expect(response.statusCode).toBe(200)
    })
    it('should return 404 if the user does not exist', async () => {
        const response = await request(app)
            .get('/api/users/')
            .set('authorization', `Bearer ${userNotFoundAccessToken}`)
        expect(response.statusCode).toBe(404)
    })
})
describe('TEST GET api/currencies/ ', () => {
    it('should return 200 if the logined user  ', async () => {
        const response = await request(app)
            .get('/api/currencies')
            .set('authorization', `Bearer ${verifiedUserAccessToken}`)
        expect(response.statusCode).toBe(200)
    })
    it('should return 404 if the user does not exist', async () => {
        const response = await request(app)
            .get('/api/currencies/')
            .set('authorization', `Bearer ${userNotFoundAccessToken}`)
        expect(response.statusCode).toBe(404)
    })
})

// describe('TEST EXPENSE', () => {
//     test('GET /expenses', async () => {
//         const res = await request(app)
//             .get('/expenses')
//             .set('Authorization', `Bearer ${token}`) // Set your token here
//         expect(res.statusCode).toEqual(200)
//     })

//     test('GET /expenses/non-group', async () => {
//         const res = await request(app)
//             .get('/expenses/non-group')
//             .set('Authorization', `Bearer ${token}`) // Set your token here
//         expect(res.statusCode).toEqual(200)
//     })

//     test('GET /expenses/amount', async () => {
//         const res = await request(app)
//             .get('/expenses/amount')
//             .set('Authorization', `Bearer ${token}`) // Set your token here
//         expect(res.statusCode).toEqual(200)
//     })

//     test('GET /', async () => {
//         const res = await request(app)
//             .get('/')
//             .set('Authorization', `Bearer ${token}`) // Set your token here
//         expect(res.statusCode).toEqual(200)
//     })

//     test('POST /expense/', async () => {
//         const res = await request(app)
//             .post('/expense/')
//             .send({
//                 /* your expense data */
//             })
//             .set('Authorization', `Bearer ${token}`) // Set your token here
//         expect(res.statusCode).toEqual(200)
//     })

//     test('GET /expense/:expense_id/transaction/:transaction_id/settle-up', async () => {
//         const res = await request(app)
//             .get(
//                 `/expense/${expense_id}/transaction/${transaction_id}/settle-up`
//             ) // Set your expense_id and transaction_id here
//             .set('Authorization', `Bearer ${token}`) // Set your token here
//         expect(res.statusCode).toEqual(200)
//     })

//     test('PUT /expense/:expense_id', async () => {
//         const res = await request(app)
//             .put(`/expense/${expense_id}`) // Set your expense_id here
//             .send({
//                 /* your updated expense data */
//             })
//             .set('Authorization', `Bearer ${token}`) // Set your token here
//         expect(res.statusCode).toEqual(200)
//     })

//     test('DELETE /expense/:expense_id', async () => {
//         const res = await request(app)
//             .delete(`/expense/${expense_id}`) // Set your expense_id here
//             .set('Authorization', `Bearer ${token}`) // Set your token here
//         expect(res.statusCode).toEqual(200)
//     })
// })

describe('TEST POST api/users/friend/ ', () => {
    it('should send 200 and create a friend ship with current user and other mentioned ids if the friend ship is not exist', async () => {
        const res = await request(app)
            .post('/friend')
            .send({ members })
            .set('Authorization', `Bearer ${verifiedUserAccessToken}`)
        expect(res.statusCode).toEqual(200)
    })
    it('should send 409 ids if the friend ship is exist', async () => {
        const res = await request(app)
            .post('/friend')
            .send({ members })
            .set('Authorization', `Bearer ${verifiedUserAccessToken}`)
        expect(res.statusCode).toEqual(409)
    })
    it('should send 404  if the friend id not exist', async () => {
        const res = await request(app)
            .post('/friend')
            .send({ members })
            .set('Authorization', `Bearer ${verifiedUserAccessToken}`)
        expect(res.statusCode).toEqual(404)
    })
    it('should send 403 if the user not verified ', async () => {
        const res = await request(app)
            .post('/friend')
            .send({ members })
            .set('Authorization', `Bearer ${verifiedUserAccessToken}`)
        expect(res.statusCode).toEqual(403)
    })
})

describe('TEST GET api/users/friend/ ', () => {
    it('should send 200 and get all  friends of current user', async () => {
        const res = await request(app)
            .get('/friend')
            .set('Authorization', `Bearer ${verifiedUserAccessToken}`)
        expect(res.statusCode).toEqual(200)
    })
})
describe('TEST GET api/users/friend/:friend_id/transactions/ ', () => {
    it('should send 200 and settle up all the pending transaction of user user and friend', async () => {
        const res = await request(app)
            .get(`/friend/${friend_id}/transactions`)
            .set('Authorization', `Bearer ${verifiedUserAccessToken}`)
        expect(res.statusCode).toEqual(200)
    })
    it('should send 200 and settle up all the pending transaction of user user and friend', async () => {
        const res = await request(app)
            .get(`/friend/${friend_id}/transactions`)
            .set('Authorization', `Bearer ${verifiedUserAccessToken}`)
        expect(res.statusCode).toEqual(200)
    })
})
describe('TEST GET api/users/friend/:friend_id/transactions/settle-up', () => {
    it('should send 200 and settle up all the pending transaction of user user and friend', async () => {
        const res = await request(app)
            .get(`/friend/${friend_id}/transactions/settle-up`)
            .set('Authorization', `Bearer ${verifiedUserAccessToken}`)
        expect(res.statusCode).toEqual(200)
    })
    it('should send 200 and settle up all the pending transaction of user user and friend', async () => {
        const res = await request(app)
            .get(`/friend/${friend_id}/transactions/settle-up`)
            .set('Authorization', `Bearer ${verifiedUserAccessToken}`)
        expect(res.statusCode).toEqual(200)
    })
})

// test('DELETE /friend/:friend_id', async () => {
//     const res = await request(app)
//         .delete(`/friend/${friend_id}`) // Set your friend_id here
//         .set('Authorization', `Bearer ${token}`) // Set your token here
//     expect(res.statusCode).toEqual(200)
// })

// test('GET /friend/:friend_id/transactions', async () => {
//     const res = await request(app)
//         .get(`/friend/${friend_id}/transactions`) // Set your friend_id here
//         .set('Authorization', `Bearer ${token}`) // Set your token here
//     expect(res.statusCode).toEqual(200)
// })

// test('GET /friend/:friend_id/transactions/settle-up', async () => {
//     const res = await request(app)
//         .get(`/friend/${friend_id}/transactions/settle-up`) // Set your friend_id here
//         .set('Authorization', `Bearer ${token}`) // Set your token here
//     expect(res.statusCode).toEqual(200)
// })

// test('GET /friend/', async () => {
//     const res = await request(app)
//         .get('/friend/')
//         .set('Authorization', `Bearer ${token}`) // Set your token here
//     expect(res.statusCode).toEqual(200)
// })

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
