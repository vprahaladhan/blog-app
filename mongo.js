const mongoose = require('mongoose')
const blogsRouter = require('express').Router()
const Blog = require('./models/blog')

// const blogSchema = mongoose.Schema({
//   title: String,
//   author: String,
//   url: String,
//   likes: Number
// })

// const Blog = mongoose.model('Blog', blogSchema)

// blogSchema.set('toJSON', {
//     transform: (document, returnedObject) => {
//       returnedObject.id = returnedObject._id.toString()
//       delete returnedObject._id
//       delete returnedObject.__v
//     }
// })

blogsRouter.get('/', (request, response) => {
  console.log("Get from mongo...")
  Blog
    .find({})
    .then(blogs => {
        blogs.forEach(blog => console.log(blog.toJSON()))
        response.json(blogs)
    })
})

blogsRouter.post('/', (request, response) => {
  const blog = new Blog(request.body)

  blog
    .save()
    .then(result => {
      response.status(201).json(result)
    })
})

module.exports = blogsRouter