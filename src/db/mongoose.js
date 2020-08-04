const { Mongoose } = require("mongoose");
const validator = require('validator')

const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false //To address the deprecation warning.
})


// const me = new User({
//     name: 'Shevo #4',
//     age: 30,
//     email: 'shevo@SHEVO.com   ',
//     password: 'pd123    '
// })

// me.save().then((result) => {
//     console.log(result)
// }).catch((error) => {
//     console.log('Error! ', error)
// })

// const Task = mongoose.model('Task', {
//     description: {
//         type: String,
//         trim: true,
//         required: true
//     },
//     completed: {
//         type: Boolean,
//         default: false
//     }
// })

// const myTask = new Task({
//     description: 'Task #2',
//     completed: false
// })

// myTask.save().then((result) => {
//     console.log(result)
// }).catch((error) => {
//     console.log('Error! ', error)
// })