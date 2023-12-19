const request = require('supertest')
const { faker } = require('@faker-js/faker')
const app = require('../app')
const bcrypt = require('bcrypt')
// const { User } = require('../models')
// Test case for mail not sent
const mailer = require('../helpers/mail.helper')
const { User } = require('../models')

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
let refresh
let access
let user_id
let token
let expired_token =
    '510cf1718890ce023fbab1a32d265527:bc3e40e3967a8d2cafe9b3aa7755aef9b66b39e1cf220ba36cd680f86e7c2bfb26004c98a32166bd6a6c4c25b3c876fb,28381879'
const data = faker.helpers.multiple(userFakeData, {
    count: 5,
})
let verified_user_access_token
let user_not_found_access_token

beforeAll(async () => {
    const password = await bcrypt.hash(data[1].password, 10)
    const payload = [
        {
            ...data[1],
            status: 'verified',
            password,
        },
        {
            ...data[3],
            password,
        },
    ]

    const user = await User.bulkCreate(payload)
    const verified_user_response = await request(app)
        .post('/api/auth/login')
        .send({ mobile: data[1].mobile, password: data[1].password })
    verified_user_access_token = verified_user_response.body.data.accessToken
    const user_not_found_response = await request(app)
        .post('/api/auth/login')
        .send({ mobile: data[3].mobile, password: data[1].password })
    user_not_found_access_token = user_not_found_response.body.data.accessToken
    const user_not_found_token_response = await request(app)
        .get('/api/auth/send-verification')
        .set('authorization', `Bearer ${user_not_found_access_token}`)
    user_not_found_token = user_not_found_token_response.body.data.token
    console.log(
        ' user_not_found_token_response, ==>',
        user_not_found_token_response.body
    )
    await User.destroy({
        where: {
            id: user[1].dataValues.id,
        },
    })
})
describe('TEST POST api/auth/signup', () => {
    // Test case for successful user registration
    it('should sign in a user with correct data', async () => {
        const res = await request(app).post('/api/auth/signup').send(data[2])
        expect(res.body.message).toEqual('Success')
        expect(res.statusCode).toEqual(200)
        expect(res.body.data.accessToken).toBeDefined()
        expect(res.body.data.status).toEqual('dummy')
        user_id = res.body.data.id
    })
    // Test case for missing required fields
    it('should fail when required fields are missing', async () => {
        const incompleteData = { ...data[2] }
        delete incompleteData.email // remove the email field
        const res = await request(app)
            .post('/api/auth/signup')
            .send(incompleteData)
        expect(res.statusCode).toEqual(400)
    })

    // Test case for invalid email format
    it('should fail when email format is invalid', async () => {
        const invalidEmailData = { ...data[2], email: 'invalidEmail' }
        const res = await request(app)
            .post('/api/auth/signup')
            .send(invalidEmailData)
        expect(res.statusCode).toEqual(400)
    })
    // Test case for invalid email format
    it('should fail when email format is invalid', async () => {
        const invalidEmailData = { ...data[2], mobile: '12345678901' }
        const res = await request(app)
            .post('/api/auth/signup')
            .send(invalidEmailData)
        expect(res.statusCode).toEqual(400)
    })
    // Test case for user already registered
    it('should fail when user is already registered', async () => {
        const res = await request(app).post('/api/auth/signup').send(data[2]) // try to register the same user again
        expect(res.statusCode).toEqual(409)
    })
})
describe('TEST POST api/auth/login', () => {
    // Test case for successful user login
    it('should log in a user with correct data', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ mobile: data[2].mobile, password: data[2].password })
        expect(res.body.message).toEqual('Success')
        expect(res.statusCode).toEqual(200)
        expect(res.body.data.accessToken).toBeDefined()
        expect(res.body.data.refresh_token).toBeDefined()
        refresh = res.body.data.refresh_token
        access = res.body.data.accessToken
    })

    // Test case for missing required fields
    it('should fail when required fields are missing', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ mobile: data[2].mobile }) // password is missing
        expect(res.statusCode).toEqual(400)
    })

    // Test case for invalid mobile number
    it('should fail when mobile number is invalid', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ mobile: 'invalidMobile', password: data[2].password })
        expect(res.statusCode).toEqual(400)
    })

    // Test case for user not found
    it('should fail when user is not found', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ mobile: '9999999999', password: data[2].password }) // this mobile number does not exist
        expect(res.statusCode).toEqual(404)
    })

    // Test case for incorrect password
    it('should fail when password is incorrect', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ mobile: data[2].mobile, password: 'incorrectPassword' })
        expect(res.statusCode).toEqual(401)
    })
})
describe('TEST POST api/auth/access-token', () => {
    // Test case for successful access token generation
    it('should generate a new access token with valid refresh token', async () => {
        const res = await request(app)
            .post('/api/auth/access-token')
            .send({ refresh_token: refresh })
        expect(res.body.message).toEqual('Success')
        expect(res.statusCode).toEqual(200)
        expect(res.body.data.accessToken).toBeDefined()
        expect(res.body.data.refresh_token).toBeDefined()
    })

    // Test case for invalid refresh token
    it('should fail when refresh token is not valid or expired', async () => {
        const res = await request(app).post('/api/auth/access-token').send({
            refresh_token:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYjYyNDA2NzgtYWMwMi00M2U0LTkwMzgtMjQzNTAwZDdlNGMxIiwiaWF0IjoxNzAxODU5MTY3LCJleHAiOjE3MDE4NjYzNjd9.a8eiVerdjw2V9UOnjmhUW-upvPEpkEltJvCFsE9N4Ag',
        })
        expect(res.statusCode).toEqual(401)
    })
})
describe('TEST get api/auth/send-verification', () => {
    // Test case for successful verification link generation
    it('should generate a verification link for a valid user', async () => {
        const res = await request(app)
            .get('/api/auth/send-verification')
            .set('authorization', `Bearer ${access}`)
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
            .set('authorization', `Bearer ${user_not_found_access_token}`)
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
            .set('authorization', `Bearer ${verified_user_access_token}`)
        expect(res.statusCode).toEqual(409)
        // Add more assertions here to check the response body
    })
    it('should handle mail sending failure when verifying user', async () => {
        // Mock the sendMail function to return a specific error
        const error = new Error(
            'Verification email could not be sent due to a temporary network issue.'
        )
        error.statusCode = 422
        jest.spyOn(mailer, 'sendMail').mockImplementation(() =>
            Promise.reject(error)
        )

        // Send the verification request with expected headers and body
        const res = await request(app)
            .get('/api/auth/send-verification')
            .set('authorization', `Bearer ${access}`)
            .send({ user_id })
        // Expect a 422 status code
        console.log('THIS IS FROM MAIL TEST ==>', res.body)
        expect(res.body.statusCode).toEqual(422)
        // Assert on the error message in the response body
        expect(res.body.message).toEqual(
            'Verification email could not be sent due to a temporary network issue.'
        )
        // Restore the original implementation of sendMail
        jest.spyOn(mailer, 'sendMail').mockRestore()
    })
})
describe('TEST get api/auth/verify', () => {
    // Test case for successful verification

    it('should accept a valid token and verify the user', async () => {
        const res = await request(app)
            .get(`/api/auth/verify/${token}`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('data.id')
        expect(res.body).toHaveProperty('data.status', 'verified')
        expect(res.body).toHaveProperty('message', 'Success')
    })
    it('should reject an exprired or invalid ', async () => {
        const res = await request(app)
            .get(`/api/auth/verify/${expired_token}`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
        expect(res.statusCode).toEqual(401)
    })
    it('should response 404 if user not found ', async () => {
        const res = await request(app)
            .get(`/api/auth/verify/${user_not_found_token}`)
            .set('authorization', `Bearer ${verified_user_access_token}`)

        expect(res.statusCode).toEqual(404)
    })
    it('should reject an invalid format token in the path', async () => {
        const res = await request(app)
            .get('/api/auth/verify/not_a_token')
            .set('authorization', `Bearer ${verified_user_access_token}`)
        console.log('Invalid token formate USER TOKEN TEST CASE ==> ', res.body)
        expect(res.statusCode).toEqual(400)
    })
})

describe('TEST post api/auth/forget-password', () => {
    // Test case for successful verification link generation
    it('should generate a forget password link for a valid user', async () => {
        const res = await request(app).post('/api/auth/forget-password').send({
            mobile: data[2].mobile,
        })
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
        jest.spyOn(mailer, 'sendMail').mockImplementation(() =>
            Promise.reject(error)
        )

        // Send the verification request with expected headers and body
        const res = await request(app)
            .post('/api/auth/forget-password')
            .set('authorization', `Bearer ${access}`)
            .send({
                mobile: '1234567890',
            })
        // Expect a 422 status code
        console.log('THIS IS FROM MAIL TEST ==>', res.body)
        expect(res.body.statusCode).toEqual(422)

        // Assert on the error message in the response body
        expect(res.body.message).toEqual(
            'Verification email could not be sent due to a temporary network issue.'
        )
        // Restore the original implementation of sendMail
        jest.spyOn(mailer, 'sendMail').mockRestore()
    })
})

afterAll(async () => {})
