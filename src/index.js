const app = require('./app')

const port = process.env.PORT // || 3000 // For when the app is running on Heroku.


app.listen(port, () => {
    console.log('Server is up on port: ' + port)
})