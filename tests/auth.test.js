const request = require('supertest')
const { faker } = require('@faker-js/faker')
const app = require('../app')

// const { User } = require('../models')
// Test case for mail not sent
const mailer = require('../helpers/mail.helper')

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
const data = userFakeData()

beforeAll(async () => {})
describe('TEST POST api/auth/signup', () => {
    // Test case for successful user registration
    it('should sign in a user with correct data', async () => {
        const res = await request(app).post('/api/auth/signup').send(data)
        expect(res.body.message).toEqual('Success')
        expect(res.statusCode).toEqual(200)
        expect(res.body.data.accessToken).toBeDefined()
        expect(res.body.data.status).toEqual('dummy')
        user_id = res.body.data.id
    })
    // Test case for missing required fields
    it('should fail when required fields are missing', async () => {
        const incompleteData = { ...data }
        delete incompleteData.email // remove the email field
        const res = await request(app)
            .post('/api/auth/signup')
            .send(incompleteData)
        expect(res.statusCode).toEqual(400)
    })

    // Test case for invalid email format
    it('should fail when email format is invalid', async () => {
        const invalidEmailData = { ...data, email: 'invalidEmail' }
        const res = await request(app)
            .post('/api/auth/signup')
            .send(invalidEmailData)
        expect(res.statusCode).toEqual(400)
    })
    // Test case for invalid email format
    it('should fail when email format is invalid', async () => {
        const invalidEmailData = { ...data, mobile: '12345678901' }
        const res = await request(app)
            .post('/api/auth/signup')
            .send(invalidEmailData)
        expect(res.statusCode).toEqual(400)
    })
    // Test case for user already registered
    it('should fail when user is already registered', async () => {
        const res = await request(app).post('/api/auth/signup').send(data) // try to register the same user again
        expect(res.statusCode).toEqual(409)
    })
})
describe('TEST POST api/auth/login', () => {
    // Test case for successful user login
    it('should log in a user with correct data', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ mobile: data.mobile, password: data.password })
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
            .send({ mobile: data.mobile }) // password is missing
        expect(res.statusCode).toEqual(400)
    })

    // Test case for invalid mobile number
    it('should fail when mobile number is invalid', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ mobile: 'invalidMobile', password: data.password })
        expect(res.statusCode).toEqual(400)
    })

    // Test case for user not found
    it('should fail when user is not found', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ mobile: '9999999999', password: data.password }) // this mobile number does not exist
        expect(res.statusCode).toEqual(404)
    })

    // Test case for incorrect password
    it('should fail when password is incorrect', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ mobile: data.mobile, password: 'incorrectPassword' })
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
describe('TEST POST api/auth/send-verification', () => {
    // Test case for successful verification link generation
    it('should generate a verification link for a valid user', async () => {
        const res = await request(app)
            .post('/api/auth/send-verification')
            .set('authorization', `Bearer ${access}`)
            .send({ user_id: user_id })
        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('data.token')
        expect(res.body).toHaveProperty('data.status', 'unVerified')
        expect(res.body).toHaveProperty('message', 'Success')
    })

    // Test case for user not found
    it('should fail when user is not found', async () => {
        const res = await request(app)
            .post('/api/auth/send-verification')
            .set('authorization', `Bearer ${access}`)
            .send({ user_id: '793504ac-e55d-464d-81cc-54a90c798186' })
        expect(res.statusCode).toEqual(404)
        // Add more assertions here to check the response body
    })

    // Test case for user already verified
    it('should fail when user is already verified', async () => {
        const res = await request(app)
            .post('/api/auth/send-verification')
            .set('authorization', `Bearer ${access}`)
            .send({ user_id })
        expect(res.statusCode).toEqual(409)
        // Add more assertions here to check the response body
    })

    // Test case for mail not sent
    it('should fail when mail is not sent', async () => {
        // Mock the sendMail function to simulate a failure
        jest.spyOn(mailer, 'sendMail').mockImplementation(() =>
            Promise.reject(new Error('Mail not sent'))
        )

        const res = await request(app)
            .post('/api/auth/send-verification')
            .set('authorization', `Bearer ${access}`)
            .send({ user_id })

        // Expect a 422 status code (Unprocessable Entity)
        expect(res.statusCode).toEqual(422)
        // Add more assertions here to check the response body

        // Restore the original implementation of the sendMail function
        jest.spyOn(mailer, 'sendMail').mockRestore()
    })
})

afterAll(async () => {
    // await
})
