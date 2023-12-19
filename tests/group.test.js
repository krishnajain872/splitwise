const request = require('supertest')
const { faker } = require('@faker-js/faker')
const app = require('../app')
const bcrypt = require('bcrypt')
const { User } = require('../models')
const { UserGroup } = require('../models')

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
let user
let group_id
// let access_token
// let expired_token = ''
const data = faker.helpers.multiple(userFakeData, {
    count: 10,
})
let verified_user_access_token
let non_verified_user_access_token
let user_not_found_access_token
let non_member_token
let member
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
    ]

    user = await User.bulkCreate(payload)
    member = [
        user[1].dataValues.id, //verified
        user[2].dataValues.id, //non verified
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

    const user_not_found_response = await request(app)
        .post('/api/auth/login')
        .send({ mobile: data[3].mobile, password: data[0].password })
    user_not_found_access_token = user_not_found_response.body.data.accessToken
    const non_member_response = await request(app)
        .post('/api/auth/login')
        .send({ mobile: data[4].mobile, password: data[0].password })
    non_member_token = non_member_response.body.data.accessToken
    await User.destroy({
        where: {
            id: user[3].dataValues.id,
        },
    })
})
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
        console.log(
            'non_verified_user_access_token => ',
            non_verified_user_access_token
        )
        const res = await request(app)
            .post('/api/groups/')
            .set('authorization', `Bearer ${non_verified_user_access_token}`)
            .send(group_data)
        expect(res.statusCode).toEqual(403)
    })
    it('should fail and return user not found when access token of non existing user', async () => {
        console.log(
            'non_verified_user_access_token => ',
            non_verified_user_access_token
        )
        const res = await request(app)
            .post('/api/groups/')
            .set('authorization', `Bearer ${user_not_found_access_token}`)
            .send(group_data)
        expect(res.statusCode).toEqual(404)
    })
})

describe('TEST POST api/groups/member/add   add member in group API', () => {
    // Test case for successful user registration
    it('should create a group with correct data and current login admin as user', async () => {
        console.log('PAYKAOD OF ADD MEMEBER ==> ', member)
        const response = await request(app)
            .post(`/api/groups/${group_id}/member/add`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
            .send({ member: member })
        expect(response.statusCode).toEqual(200)
        expect(response.body.message).toEqual('Success')
        console.log(response.body)
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
        expect(res.statusCode).toEqual(403)
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
describe('TEST POST api/groups/member/add   add member in group API', () => {
    // Test case for successful user registration
    it('should create a group with correct data and current login admin as user', async () => {
        console.log('PAYKAOD OF ADD MEMEBER ==> ', member)
        const response = await request(app)
            .post(`/api/groups/${group_id}/member/add`)
            .set('authorization', `Bearer ${verified_user_access_token}`)
            .send({ member: member })
        expect(response.statusCode).toEqual(200)
        expect(response.body.message).toEqual('Success')
        console.log(response.body)
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
        expect(res.statusCode).toEqual(403)
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

afterAll(async () => {
    await User.truncate()
    await Group.truncate()
    await UserGroup.truncate()
})
