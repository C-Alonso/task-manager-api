const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { userOneId, userOne, setUpDatabase } = require('./fixtures/db')



//Delete all the existing users.
beforeEach(setUpDatabase)

test('Should signup a new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Test Shevo',
        email: 'testshevo@mailinator.com',
        password: 'TestPwd!'
    }).expect(201)

    //Assert that the database was changed correctly.
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    //Assertions about the response.
    //expect(response.body.user.name).toBe('Test Shevo')
    expect(response.body).toMatchObject({
        user: {
            name: 'Test Shevo',
            email: 'testshevo@mailinator.com'
        },
        token: user.tokens[0].token
    })

    //Check that the password is not stored as plain text.
    expect(user.password).not.toBe('TestPwd!')
})

test('Should login existing user', async() => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    //Assert that the token has been saved on the DB.
    user = await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login non-existing user', async() => {
    await request(app).post('/users/login').send({
        email: 'notlogin@shevo.com',
        password: userOne.password
    }).expect(400)
})

test('Should get profile for user', async() => {
    await request(app)
        .get('/users/me')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should get not profile for unauthenticated user', async() => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete user account', async() => {
    await request(app)
        .delete('/users/me')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    
    //Verify that the user doesn't exist on the DB anymore.
    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not delete user account without authentication', async() => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})


test('Should upload avatar image', async() => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'C:\\Users\\Carlos\\Documents\\Node Course\\task-manager\\tests\\fixtures\\me.jpg')
        .expect(200)

    //Check that the binary data of the image was stored in the DB.
    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))    
})

test('Should update valid user fields', async() => {
    await request(app)
        .patch('/users/me')
        .send({
            name: 'Updated Shevo'
        })
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(200)
    
    user = await User.findById(userOneId)
    expect(user.name).toBe('Updated Shevo')
})

test('Should not update invalid user fields', async() => {
    await request(app)
        .patch('/users/me')
        .send({
            location: 'Updated Shevo'
        })
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(400)
    
    user = await User.findById(userOneId)
    expect(user.name).toBe('Shevo #1')
})

