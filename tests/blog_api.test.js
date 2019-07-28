const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
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

    const blogs = await testHelper.notesInDB()
    const titles = blogs.map(blog => blog.title)
    expect(blogs.length).toBe(initialBlogs.length + 1)
    expect(titles).toContain('IT')
})

test("blog with empty title can't be addded", async () => {
    const blog = Blog({
        author: "Prahal",
        url: "none",
        likes: 0
    })
    await api
            .post('/api/blogs')
            .send(blog)
            .expect(400)
    
    const blogs = await testHelper.notesInDB()
    expect(blogs.length).toBe(1)
})

test('a specific blog can be viewed', async () => {
    const blogsAtStart = await testHelper.notesInDB()
  
    const blogToView = blogsAtStart[0]
  
    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  
    expect(resultBlog.body).toEqual(blogToView)
})

test('a blog can be deleted', async () => {
    const blogsAtStart = await testHelper.notesInDB()
    const blogToDelete = blogsAtStart[0]
  
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)
  
    const blogsAtEnd = await testHelper.notesInDB()
  
    expect(blogsAtEnd.length).toBe(initialBlogs.length - 1)
  
    const titles = blogsAtEnd.map(blog => blog.title)
  
    expect(titles).not.toContain(blogToDelete.title)
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

    const blogs = await testHelper.notesInDB()
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
  
afterAll(() => {
    mongoose.connection.close()
})