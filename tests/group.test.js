// const request = require('supertest')
// const { faker } = require('@faker-js/faker')
// const app = require('../app')
// const bcrypt = require('bcrypt')
// const { User } = require('../models')

// // user payload
// const userFakeData = () => {
//     return {
//         first_name: faker.internet.userName(),
//         last_name: faker.internet.userName(),
//         email: process.env.RECEIVER_EMAIL,
//         avatar: faker.image.avatar(),
//         password: faker.internet.password(),
//         mobile: String(faker.number.int({ min: 1000000000, max: 9999999999 })),
//     }
// }

// const categories = ['trip', 'home', 'couple', 'other', 'foodie']
// const category = categories[Math.floor(Math.random() * categories.length)]

// const groupFakeData = () => {
//     return {
//         title: faker.person.fullName(),
//         display_picture: faker.image.avatar(),
//         category: category,
//     }
// }
// let group_id
// let access_token
// let expired_token = ''
// const data = faker.helpers.multiple(userFakeData, {
//     count: 5,
// })
// let verified_user_access_token
// let non_verified_user_access_token
// let user_not_found_access_token
// beforeAll(async () => {
//     const password = await bcrypt.hash(data[1].password, 10)
//     const payload = [
//         {
//             ...data,
//             password,
//         },
//     ]

//     const user = await User.bulkCreate(payload)

//     const verified_user_response = await request(app)
//         .post('/api/auth/login')
//         .send({ mobile: data[1].mobile, password: data[1].password })

//     await request(app)
//         .get('/api/auth/send-verification')
//         .set(
//             'authorization',
//             `Bearer ${verified_user_response.body.data.accessToken}`
//         )

//     await request(app)
//         .get('/api/auth/verify')
//         .set(
//             'authorization',
//             `Bearer ${verified_user_response.body.data.accessToken}`
//         )

//     verified_user_access_token = verified_user_response.body.data.accessToken

//     const non_verified_user_response = await request(app)
//         .post('/api/auth/login')
//         .send({ mobile: data[2].mobile, password: data[1].password })
//     non_verified_user_access_token =
//         non_verified_user_response.body.data.accessToken

//     const user_not_found_response = await request(app)
//         .post('/api/auth/login')
//         .send({ mobile: data[3].mobile, password: data[1].password })
//     user_not_found_access_token = user_not_found_response.body.data.accessToken

//     await User.destroy({
//         where: {
//             id: user[3].dataValues.id,
//         },
//     })
// })
// describe('TEST POST api/groups/  create group API', () => {
//     // Test case for successful user registration
//     it('should create a group with correct data and current login admin as user', async () => {
//         const res = await request(app)
//             .post('/api/groups/')
//             .set('authorization', `Bearer ${verified_user_access_token}`)
//             .send(groupFakeData())
//         expect(res.body.message).toEqual('Success')
//         expect(res.statusCode).toEqual(200)
//         expect(res.body.data.accessToken).toBeDefined()
//         expect(res.body.data.status).toEqual('dummy')
//         user_id = res.body.data.id
//     })
//     // Test case for missing required fields
//     it('should fail when required fields are missing', async () => {
//         const incompleteData = { ...data[2] }
//         delete incompleteData.email // remove the email field
//         const res = await request(app)
//             .post('/api/auth/signup')
//             .send(incompleteData)
//         expect(res.statusCode).toEqual(400)
//     })

//     // Test case for invalid email format
//     it('should fail when email format is invalid', async () => {
//         const invalidEmailData = { ...data[2], email: 'invalidEmail' }
//         const res = await request(app)
//             .post('/api/auth/signup')
//             .send(invalidEmailData)
//         expect(res.statusCode).toEqual(400)
//     })
//     // Test case for invalid email format
//     it('should fail when email format is invalid', async () => {
//         const invalidEmailData = { ...data[2], mobile: '12345678901' }
//         const res = await request(app)
//             .post('/api/auth/signup')
//             .send(invalidEmailData)
//         expect(res.statusCode).toEqual(400)
//     })
//     // Test case for user already registered
//     it('should fail when user is already registered', async () => {
//         const res = await request(app).post('/api/auth/signup').send(data[2]) // try to register the same user again
//         expect(res.statusCode).toEqual(409)
//     })
// })

// afterAll(async () => {
//     await User.truncate()
// })
