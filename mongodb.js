// const mongodb = require('mongodb')
// const MongoClient = mongodb.MongoClient
// const ObjectID = mongodb.ObjectID

const {MongoClient, ObjectID} = require('mongodb')

const connectionURL = 'mongodb://127.0.0.1:27017'
const databaseName = 'task-manager'

//Not used. It is possible to set it, though.
const id = new ObjectID()

//The connection is an asyncronous operation.
MongoClient.connect(connectionURL, {useNewUrlParser: true}, (error, client) => {
    if (error) {
        return console.log('Unable to connect to database!')
    } 
    
    console.log('Connected correctly!')
    const db = client.db(databaseName)

    //INSERT

    // db.collection('users').insertOne({
    //     name: 'Shevo',
    //     age: 29
    // }, (error, result) => {
    //     if (error) {
    //         return console.log('Unable to insert user.')
    //     }

    //     console.log(result.ops)
    // })

    // db.collection('users').insertMany([
    //     {
    //         name: 'Shevo #2',
    //         age: 33
    //     },
    //     {
    //         name: 'Conejo',
    //         age: 30
    //     }
    // ], (error, result) => {
    //     if (error) {
    //         return console.log('Unable to insert users!')
    //     }

    //     console.log(result.ops)
    // })

    // db.collection('tasks').insertMany([
    //     {
    //         description: 'Task #1',
    //         completed: 'Complete'
    //     },
    //     {
    //         description: 'Task #2',
    //         completed: 'Incomplete'
    //     },
    //     {
    //         description: 'Task #3',
    //         completed: 'Complete'
    //     }
    // ], (error, result) => {
    //     if (error) {
    //         return console.log('Unable to insert tasks!')
    //     }

    //     console.log(result.ops)
    // })

    // FIND

    // db.collection('users').findOne({ name: 'Shevo' }, (error, user) => {
    //     if (error) {
    //         return console.log('Unable to fetch document.')
    //     }

    //     console.log(user)
    // })

    // db.collection('users').find({ name: 'Shevo' }).toArray((error, users) => {
    //     console.log(users)
    // })

    // db.collection('users').find({ name: 'Shevo' }).count((error, count) => {
    //     console.log(count)
    // })

    // db.collection('tasks').findOne({ _id: new ObjectID('5f14c71dacb5c826a45805ce') }, (error, task) => {
    //         if (error) {
    //             return console.log('Unable to fetch document.')
    //         }
    
    //         console.log(task)
    //     })

    // db.collection('tasks').find({ completed: true }).toArray((error, tasks) => {
    //     console.log(tasks)
    // })

    // UPDATE

    // db.collection('users').updateOne({
    //     _id: new ObjectID('5f14c4fef6573630acaca2e2')
    // }, {
    //     $set: {
    //         name: 'Shevo #1'
    //     },
    //     $inc: {
    //         age: 1
    //     }
    // }).then((result) => {
    //     console.log(result)
    // }).catch((error) => {
    //     console.log(error)
    // })

    // db.collection('tasks').updateMany({
    //     completed: false 
    // }, {
    //     $set: {
    //         completed: true
    //     }
    // }).then((result) => {
    //     console.log(result.modifiedCount)
    // }).catch((error) => {
    //     console.log(error)
    // })

    //DELETE

    // db.collection('users').deleteMany({
    //     age: 31
    // }).then((result) => {
    //     console.log(result)
    // }).catch((error) => {
    //     console.log(error)
    // })

    // db.collection('tasks').deleteOne({
    //     description: 'Task #3'
    // }).then((result) => {
    //     console.log(result)
    // }).catch((error) => {
    //     console.log(error)
    // })


})