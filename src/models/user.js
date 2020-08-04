const { Mongoose } = require("mongoose");
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true //Gets rid of spaces        
    },
    password: {
        type: String,        
        required: true,
        trim: true, //Gets rid of spaces    
        minlength: 7,
        validate(value) {
            if(value.toLowerCase().includes('password')) {
                throw new Error('The password should not contain the word "password"')
            }
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Not a valid e-mail address.')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive number')
            }
        }
    },
    tokens: [{ //Array of tokens used.
        token: {
        type: String,
        required: true
        }
    }],
    avatar: { //Not required. The validation is done through multer.
        type: Buffer
    }
}, { //Here we specify the schema options.
    timestamps: true
})

//To stablish the relation between a user and its' tasks. It is not stored in the DB.
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id', //ID here.
    foreignField: 'creator' //User's ID on the task.
})


//This one is a model method.
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('There is no registered with this e-mail address')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

//And this one is an instance method.
userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

//And this one is an instance method.
//This works because, behind the scenes, JSON.stringify() gets called by the response.
userSchema.methods.toJSON = function() {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

//Middleware
//Hash the plain-text password before saving.
userSchema.pre('save', async function (next) { //No arrow function because it doesn't support the 'this' binding.
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8) //Hashing!
    }

    next()
})

//Delete user tasks when user is removed.
userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({ creator: user._id })
    next()
})

const User = mongoose.model('User', userSchema)


module.exports = User