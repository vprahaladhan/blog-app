const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')
const mongoose = require('mongoose')

blogsRouter.get('/', async (request, response, next) => {
    try {
        const blogs = await Blog.find({}).populate('user', {username: 1, name: 1})
        response.json(blogs.map(blog => blog.toJSON()))
    }
    catch(error) {
        next(error)
    }
})

blogsRouter.post('/', async (request, response, next) => {
    try {
        const decodedToken = await jwt.verify(request.token, process.env.SECRET)
        const blog = new Blog({
            title: request.body.title,
            author: request.body.author,
            url: request.body.url,
            likes: request.body.likes,
            user: decodedToken.id
        })
        const newBlog = await blog.save()
        const user = await User.findById(decodedToken.id) 
        user.blogs = user.blogs.concat(newBlog._id)
        await user.save()
        response.status(201).json(newBlog)
    }
    catch(error) {
        error.errmsg = "`title` not unique!"
        next(error)
    }
})

blogsRouter.get('/:id', async (request, response, next) => {
    try {
        const blog = await Blog.findById(request.params.id).populate('user', {username: 1, name: 1})
        console.log(blog)
        blog ? response.json(blog) : response.status(404).end()
    }
    catch(error) {
        next(error)
    }
})

blogsRouter.delete('/:id', async (request, response, next) => {
    try {
        console.log(`In delete blog of server...`)
        const decodedToken = await jwt.verify(request.token, process.env.SECRET)
        console.log(`Decoded token: ${decodedToken.username}`)
        const blog = await Blog.findById(request.params.id)
        if (blog) {
            const user = await User.findById(blog.user)
            if (decodedToken.id.toString() === user.id.toString()) {
                await user.blogs.splice(user.blogs.indexOf(blog.id), 1)
                await user.save()
                await blog.delete()
                response.status(204).end()
            }
            else response.status(401).json({error: "Invalid token!"}).send() 
        }
        else response.status(400).json({error: "Invalid blog id"}).send()
    }
    catch(error) {
        console.log(`Error in decoding token...${error}`)
        next(error)
    }
})

blogsRouter.put('/:id', async (request, response, next) => {
    console.log("In server's put blog!")
    const blog = request.body
    console.log("Blog: ", blog)
    try {
        response.json(await Blog.findByIdAndUpdate(request.params.id, blog, {new: true}).populate('user', {username: 1, name: 1}))
    }
    catch(error) {
        next(error)
    }
})

module.exports = blogsRouter