const usersRouter = require('express').Router()
const User = require('../models/user')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

usersRouter.get('/', async (request, response, next) => {
    try {
        const users = await User.find({}).populate('blogs', { title: 1, author: 1 })
        response.json(users.map(user => user.toJSON()))
    }
    catch(error) {
        next(error)
    }
})
  
usersRouter.post('/', async (request, response, next) => {
    const saltRounds = 10
    const body = request.body
    body.password = body.hasOwnProperty('password') ? body.password : ''
    const password = body.password.length < 3 ? 
        body.password : await bcrypt.hash(body.password, saltRounds)

    const user = new User({
        username: body.username,
        name: body.name,
        password
    })

    try {
        const newuser = await user.save()
        response.status(201).json(newuser)
    }
    catch(error) {
        error.errmsg = '`username` not unique!'
        next(error)
    }
})

usersRouter.get('/:id', async (request, response, next) => {
    try {
        const user = await User.findById(request.params.id)
        console.log(user)
        user ? response.json(user) : response.status(404).end()
    }
    catch(error) {
        next(error)
    }
})

usersRouter.delete('/:id', async (request, response, next) => {
    try {
        await User.findByIdAndDelete(request.params.id)
        response.status(204).end()
    }
    catch(error) {
        next(error)
    }
})

usersRouter.put('/:id', async (request, response, next) => {
    const user = request.body

    try {
        response.json((await User.findByIdAndUpdate(request.params.id, user, {new: true})))
    }
    catch(error) {
        next(error)
    }
})

module.exports = usersRouter