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

const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.substring(7)
    }
    return null
}
  
blogsRouter.post('/', async (request, response, next) => {
    const user = await User.findById(request.body.userId)
    const token = getTokenFrom(request)
    const blog = new Blog({
        title: request.body.title,
        author: request.body.author,
        url: request.body.url,
        likes: request.body.likes,
        user: user._id
    })
    
    try {
        const decodedToken = await jwt.verify(token, process.env.SECRET)
        const newBlog = await blog.save()
        user.blogs = user.blogs.concat(newBlog._id)
        await user.save()
        response.status(201).json(newBlog)
    }
    catch(error) {
        next(error)
    }
})

blogsRouter.get('/:id', async (request, response, next) => {
    try {
        const blog = await Blog.findById(request.params.id)
        console.log(blog)
        blog ? response.json(blog) : response.status(404).end()
    }
    catch(error) {
        next(error)
    }
})

blogsRouter.delete('/:id', async (request, response, next) => {
    try {
        await Blog.findByIdAndDelete(request.params.id)
        response.status(204).end()
    }
    catch(error) {
        next(error)
    }
})

blogsRouter.put('/:id', async (request, response, next) => {
    const blog = request.body

    try {
        response.json((await Blog.findByIdAndUpdate(request.params.id, blog, {new: true})))
    }
    catch(error) {
        next(error)
    }
})

module.exports = blogsRouter