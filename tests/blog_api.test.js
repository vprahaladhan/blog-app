const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const testHelper = require('./test_helper')

const initialBlogs = testHelper.initialBlogs
  
beforeEach(async () => {
    await Blog.deleteMany({})
  
    let blogObject = new Blog(initialBlogs[0])
    await blogObject.save()
  
    noteObject = new Blog(initialBlogs[1])
    await blogObject.save()
})

test('blogs are returned as json', async () => {    
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('there is 1 blog', async () => {
    const response = await api.get('/api/blogs')
  
    expect(response.body.length).toBe(initialBlogs.length)
  })
  
test('the first blog is about world peace', async () => {
    const response = await api.get('/api/blogs')
  
    expect(response.body[0].title).toBe(initialBlogs[0].title)
})

test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
  
    expect(response.body.length).toBe(initialBlogs.length)
})
  
test('a specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')
  
    const contents = response.body.map(r => r.title)
  
    expect(contents).toContain('World Peace')
})

test('a new blog can be added', async () => {
    const blog = Blog({
        title: 'IT',
        author: 'Prahal',
        url: 'http://www.notsouseful.com',
        likes: 100000
    })
    await api
            .post('/api/blogs')
            .send(blog)
            .expect(201)

    const blogs = await testHelper.blogsInDB()
    const titles = blogs.map(blog => blog.title)
    expect(blogs.length).toBe(initialBlogs.length + 1)
    expect(titles).toContain('IT')
})

test("blog with empty title can't be added", async () => {
    const blog = Blog({
        author: "Prahal",
        url: "none",
        likes: 0
    })
    await api
            .post('/api/blogs')
            .send(blog)
            .expect(400)
    
    const blogs = await testHelper.blogsInDB()
    expect(blogs.length).toBe(1)
})

test('a specific blog can be viewed', async () => {
    const blogsAtStart = await testHelper.blogsInDB()
  
    const blogToView = blogsAtStart[0]
  
    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  
    expect(resultBlog.body).toEqual(blogToView)
})

test('a blog can be deleted', async () => {
    const blogsAtStart = await testHelper.blogsInDB()
    const blogToDelete = blogsAtStart[0]
  
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)
  
    const blogsAtEnd = await testHelper.blogsInDB()
  
    expect(blogsAtEnd.length).toBe(initialBlogs.length - 1)
  
    const titles = blogsAtEnd.map(blog => blog.title)
  
    expect(titles).not.toContain(blogToDelete.title)
})

test('a blog can be updated', async () => {
    const blogsAtStart = await testHelper.blogsInDB()
    const blogToUpdate = blogsAtStart[0]
    const likesBeforeUpdate = blogToUpdate.likes
    blogToUpdate.likes = likesBeforeUpdate + 1000
  
    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(blogToUpdate)
      .expect(200)
  
    const blogsAtEnd = await testHelper.blogsInDB()

    expect(blogsAtEnd[0].likes).toBeGreaterThan(likesBeforeUpdate)
})

test('unique identifier property of blogs is named id', async () => {
    const blogs = (await api.get('/api/blogs')).body
    blogs.forEach(blog => expect(blog.id).toBeDefined())
})

test('likes defaults to 0 when not set in request body', async () => {
    const blogWithNoLikes = Blog({
        title: 'Travel',
        author: 'WanderingSoul',
        url: 'http://www.wanderlust.com'
    })
    await api
            .post('/api/blogs')
            .send(blogWithNoLikes)
            .expect(201)

    const blogs = await testHelper.blogsInDB()
    const savedBlog = blogs.find(blog => blog.title == blogWithNoLikes.title)
    expect(savedBlog.likes).toBe(0)
})

test('status 400 response when title & author not set in request body', async () => {
    const blogWithoutTitleOrAuthor = Blog({
        url: 'http://www.wanderlust.com'
    })
    await api
            .post('/api/blogs')
            .send(blogWithoutTitleOrAuthor)
            .expect(400)
})

test('creation of blog fails if user not authenticated', async () => {
    const blog = Blog({
        title: 'IT',
        author: 'Prahal',
        url: 'http://www.notsouseful.com',
        likes: 100000
    })

    await api
            .post('/api/blogs')
            .send(blog)
            .expect(401)

    const blogs = await testHelper.blogsInDB()
    const titles = blogs.map(blog => blog.title)
    expect(blogs.length).toBe(initialBlogs.length)
})

describe('when there is initially one user at db', () => {
    beforeEach(async () => {
        await User.deleteMany({})
        const user = new User({ 
            username: 'root', 
            name: 'Sample', 
            password: 'sekret' 
        })
        await user.save()
    })
  
    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await testHelper.usersInDB()
  
        const newUser = {
            username: 'mluukkai',
            password: 'salainen',
            name: "Lukkainen"
        }
        
        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)
  
        const usersAtEnd = await testHelper.usersInDB()
        expect(usersAtEnd.length).toBe(usersAtStart.length + 1)
  
        const usernames = usersAtEnd.map(user => user.username)
        expect(usernames).toContain(newUser.username)
    })

    describe('tests for part 4.16 Bloglist expansion step 5', () => {
        test('creation fails with proper statuscode and message if username is not unique', async () => {
            const usersAtStart = await testHelper.usersInDB()
    
            const newUser = {
                username: 'root',
                name: 'Superuser',
                password: 'salainen',
            }
    
            const result = await api
                                .post('/api/users')
                                .send(newUser)
                                .expect(400)
                                .expect('Content-Type', /application\/json/)
    
            expect(result.body.error).toContain('`username` not unique!')
    
            const usersAtEnd = await testHelper.usersInDB()
            expect(usersAtEnd.length).toBe(usersAtStart.length)
        })

        test('creation fails with missing username', async () => {
            const usersAtStart = await testHelper.usersInDB()
    
            const newUser = {
                name: 'Superuser',
                password: 'salainen',
            }
    
            const result = await api
                                .post('/api/users')
                                .send(newUser)
                                .expect(400)
                                .expect('Content-Type', /application\/json/)
    
            expect(result.body.error).toContain("`username` is required")
    
            const usersAtEnd = await testHelper.usersInDB()
            expect(usersAtEnd.length).toBe(usersAtStart.length)
        })

        test('creation fails with blank username', async () => {
            const usersAtStart = await testHelper.usersInDB()
    
            const newUser = {
                username: '',
                name: 'Superuser',
                password: 'salainen',
            }
    
            const result = await api
                                .post('/api/users')
                                .send(newUser)
                                .expect(400)
                                .expect('Content-Type', /application\/json/)
    
            expect(result.body.error).toContain("`username` is required")
    
            const usersAtEnd = await testHelper.usersInDB()
            expect(usersAtEnd.length).toBe(usersAtStart.length)
        })

        test('creation fails with blank password', async () => {
            const usersAtStart = await testHelper.usersInDB()
    
            const newUser = {
                username: 'sample',
                name: 'Superuser',
                password: '',
            }
    
            const result = await api
                                .post('/api/users')
                                .send(newUser)
                                .expect(400)
                                .expect('Content-Type', /application\/json/)
    
            expect(result.body.error).toContain("`password` is required")
    
            const usersAtEnd = await testHelper.usersInDB()
            expect(usersAtEnd.length).toBe(usersAtStart.length)
        })

        test('creation fails with missing password', async () => {
            const usersAtStart = await testHelper.usersInDB()
    
            const newUser = {
                username: 'sample',
                name: 'Superuser',
            }
    
            const result = await api
                                .post('/api/users')
                                .send(newUser)
                                .expect(400)
                                .expect('Content-Type', /application\/json/)
    
            expect(result.body.error).toContain("`password` is required")
    
            const usersAtEnd = await testHelper.usersInDB()
            expect(usersAtEnd.length).toBe(usersAtStart.length)
        })

        test('creation fails with username less than 2 chars long', async () => {
            const usersAtStart = await testHelper.usersInDB()
    
            const newUser = {
                username: 'ab',
                name: 'Superuser',
                password: 'salainen',
            }
    
            const result = await api
                                .post('/api/users')
                                .send(newUser)
                                .expect(400)
                                .expect('Content-Type', /application\/json/)
    
            expect(result.body.error).toContain("shorter than the minimum allowed length")
    
            const usersAtEnd = await testHelper.usersInDB()
            expect(usersAtEnd.length).toBe(usersAtStart.length)
        })

        test('creation fails with password less than 2 chars long', async () => {
            const usersAtStart = await testHelper.usersInDB()
    
            const newUser = {
                username: 'sample',
                name: 'Superuser',
                password: '12',
            }
    
            const result = await api
                                .post('/api/users')
                                .send(newUser)
                                .expect(400)
                                .expect('Content-Type', /application\/json/)
    
            expect(result.body.error).toContain("shorter than the minimum allowed length")
    
            const usersAtEnd = await testHelper.usersInDB()
            expect(usersAtEnd.length).toBe(usersAtStart.length)
        })
    })
})
  
afterAll(() => {
    mongoose.connection.close()
})