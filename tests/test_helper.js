const Blog = require('../models/blog')
const User = require('../models/user')

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

const blogsInDB = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const nonExistingUserId = async () => {
  const user = new User({ 
      username: 'willremovethissoon',
      name: 'nonexistent',
      password: 'none'
  })
  await user.save()
  await user.remove()
  return user._id.toString()
}

const usersInDB = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

module.exports = {
  initialBlogs, nonExistingId, blogsInDB, nonExistingUserId, usersInDB
}