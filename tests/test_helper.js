const Blog = require('../models/blog')

const initialBlogs = [
    {
        title:"World Peace",
        author: 'Harvey Norman',
        url: 'htttp://www.worldpeace.com',
        likes:0
    }
]

const nonExistingId = async () => {
    const blog = new Blog({ 
        title: 'willremovethissoon',
        author: 'none'
    })
    await blog.save()
    await blog.remove()
    return blog._id.toString()
}

const notesInDB = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

module.exports = {
  initialBlogs, nonExistingId, notesInDB
}