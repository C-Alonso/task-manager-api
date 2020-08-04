const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendFarewellEmail } = require('../emails/account')
const router = new express.Router()

//Dummy route
// router.get('/test', (req, res) => {
//     res.send('Router from another file.')
// })

router.post('/users', async (req, res) => {
    const user = new User(req.body)

    //We can use await because we are inside an async function.
    //We are awaiting for the promise from the save method.
    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }  

    //This code is going to be left here just as a example of how to do this without async().
    // user.save().then(() => {
    //     res.status(201).send(user)
    // }).catch((e) => {
    //     res.status(400).send(e)
    // })
})

//Function to find user by e-mail and credentials.
router.post('/users/login', async (req, res) => {
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async(req, res) => {
    //We will target the specific token that the user is logging out from.
    //This way, multiple sessions can be simultaneously ran.
    try {
        //We are gonna create a subset that EXCLUDES the token that was used for this session
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async(req, res) => {    
    try {
        //We are gonna create a subset that EXCLUDES the token that was used for this session
        req.user.tokens = []
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

//Runs the auth middleware before running the route function.
//Gets own profile.
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

// //Runs the auth middleware before running the route function. //This function is not used.
// router.get('/users', auth, async (req, res) => {
//     try{
//         const users = await User.find({})
//         res.send(users)
//     } catch (e) {
//         res.status(500).send()
//     }

//     // User.find({}).then((users) => {
//     //     res.send(users)
//     // }).catch((e) => {
//     //     res.status(500).send() //Internal server error
//     // })
// })

//This function is no longer needed because authenticated users shouldn't be
//accessing to random users by id.
// router.get('/users/:id', async (req, res) => {
//     const _id = req.params.id

//     try{
//         const user = await User.findById(_id)
        
//         if(!user) {
//             return res.status(404).send()
//         }

//         res.send(user)
//     } catch (e) {
//         res.status(500).send()
//     }
    
//     // User.findById(_id).then((user) => {
//     //     if(!user) {
//     //         return res.status(404).send()
//     //     }

//     //     res.send(user) //Status: 200
//     // }).catch((e) => {
//     //     res.status(500).send(e)
//     // })
// })


router.patch('/users/me', auth, async (req, res) => {    
    const updates = Object.keys(req.body)
    const allowedUpdate = ['name', 'email', 'password', 'age']
    //ALL of the fields that the client wants to update must be contained in allowedUpdate.
    const isValidPatch = updates.every((update) => allowedUpdate.includes(update))

    if (!isValidPatch) {
        return res.status(400).send({error: 'Invalid updates for a user!'})
    }

    try{
        //const user = await User.findById(req.params.id)
        user = req.user

        //The 'update' is going to be a string (f.e.: 'name').
        //We loop through each of the fields that the client wants to update.
        updates.forEach((update) => user[update] = req.body[update])

        await user.save()


        //The method below was changed for the password to be hashable (using the mongoose library).
        //new: true -> brings the updated object (not the one previous to the update operation).
        //const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })    

        // if(!user) {
        //     return res.status(404).send()
        // }

        res.send(user)
    } catch(e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        //These lines are no longer needed because the user is extracted from the DB through the authentication.
        // const user = await User.findByIdAndDelete(req.user._id)

        // if(!user) {
        //     return res.status(404).send()
        // }

        await req.user.remove()
        sendFarewellEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

const upload = multer({
    //dest: 'avatars', Instead of saving to the avatars directory, we pass it to the function.
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error("Please provide an image in JPG, JPEG, or PNG format"))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    //req.user.avatar = req.file.buffer //only available when there is no 'dest' option defined.

    //Everything will be a resized png.
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => { //Error feedback. That is a call signature, must be provided just like that.
    res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined //only available when there is no 'dest' option defined.
    await req.user.save()
    res.send()
}, (error, req, res, next) => { //Error feedback. That is a call signature, must be provided just like that.
    res.status(400).send({ error: error.message })
})

router.get('/users/:id/avatar', async(req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

module.exports = router