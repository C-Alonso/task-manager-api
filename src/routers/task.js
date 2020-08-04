const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()



router.post('/tasks', auth, async (req, res) => {
    //Old solution
    //const task = new Task(req.body)

    //New solution
    const task = new Task({
        ...req.body, //Copies all of the properties from 'body'
        creator: req.user._id
    })
    
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }

    // task.save().then(() => {
    //     res.status(201).send(task)
    // }).catch((e) => {
    //     res.status(400).send(e)
    // })
})

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=0
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
    //If completed is not provided, we pass it as it is.
    const match = {}
    const sort = {}

    if (req.query.completed) {
        //If the value provided is not "true", then we set it to false.
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
        //We use the 'ternary' operator. 'desc' ? -> -1; 1 otherwise.
        //parts[0] is the name of the property we set on 'sort'.
    }
    try{
        //const tasks = await Task.find({ creator: req.user._id }) <--This one would work as well.
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send()
    }

    // Task.find({}).then((tasks) => {
    //     res.send(tasks)
    // }).catch((e) => {
    //     res.status(500).send() //Internal server error
    // })
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    
    try{
        //const task = await Task.findById(_id)
        const task = await Task.findOne({ _id, creator: req.user._id })

        if(!task) {
            res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }


    // Task.findById(_id).then((task) => {
    //     if(!task) {
    //         return res.status(404).send()
    //     }

    //     res.send(task) //Status: 200
    // }).catch((e) => {
    //     res.status(500).send()
    // })
})



router.patch('/tasks/:id', auth, async (req, res) => {    
    const updates = Object.keys(req.body)
    const allowedUpdate = ['completed', 'description']
    //ALL of the fields that the client wants to update must be contained in allowedUpdate.
    const isValidPatch = updates.every((update) => allowedUpdate.includes(update))

    if (!isValidPatch) {
        return res.status(400).send({error: 'Invalid updates for a task!'})
    }

    try{
        const task = await Task.findOne({ _id: req.params.id, creator: req.user._id })
        
        if(!task) {
            return res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])

        await task.save()

        //new: true -> brings the updated object (not the one previous to the update operation).
        //const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true})    


        res.send(task)
    } catch(e) {
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        //const task = await Task.findByAndDelete(req.params.id)
        const task = await Task.findOneAndDelete({ _id: req.params.id, creator: req.user._id })
        console.log('Here1')
        if (!task) {
            res.status(404).send()
        }
        console.log('Here2')
        res.send(task)
    } catch (e) {
        console.log('Here3')
        res.status(500).send(e)
    }
})


module.exports = router