const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const mongoose = require('mongoose')

blogsRouter.get('/', async (request, response, next) => {
    try {
        const blogs = await Blog.find({})
        response.json(blogs.map(blog => blog.toJSON()))
    }
    catch(error) {
        next(error)
    }
})
  
blogsRouter.post('/', async (request, response, next) => {
    const blog = new Blog({
        title: request.body.title,
        author: request.body.author,
        url: request.body.url,
        likes: request.body.likes
    })

    try {
        const newBlog = await blog.save()
        response.status(201).json(newBlog)
    }
    catch(error) {
        response.status(400).send()
        // next(error)
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