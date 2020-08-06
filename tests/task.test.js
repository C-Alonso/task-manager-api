const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const { 
    userOneId,
    userOne,
    userTwo,
    taskOne,
    setUpDatabase 
} = require('./fixtures/db')

//Delete all the existing users.
beforeEach(setUpDatabase)

test('Should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'Test task'
        })
        .expect(201)

    //Check that the task is not null.
    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()

    //Check that the status of the task is set to "false".
    expect(task.completed).toBe(false)
})

test('Should request all tasks for userOne', async() => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        expect(200)

    expect(response.body.length).toBe(2)
    expect(response.body[0].completed).toBe(false)
    expect(response.body[1].completed).toBe(true)
})


test('Should not delete task that belongs to another user', async() => {
    const response = await request(app)
        .delete('//tasks/' + taskOne._id)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)
    
    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})
