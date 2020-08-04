const express = require('express')
//Doesn't grab anything. Just ensures connection to the db.
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT // || 3000 // For when the app is running on Heroku.

//MIDDLEWARE
// app.use((req, res, next) => {
//     if(req.method === 'GET') {
//         res.send('GET requests are disabled.')
//     } else {
//         next()
//     }
// })

//MAINTENANCE MIDDLEWARE
// app.use((req, res, next) => {
//     res.status(503).send('THE SERVER IS UNDER MAINTENANCE')
//     //next() <-- Doesn't get called so we the request doesn't get handled.
// })s

//Automatically parse incoming JSON
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('Server is up on port: ' + port)
})