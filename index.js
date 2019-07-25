// require("dotenv").config()
// const http = require('http')
// const express = require('express')
// const app = express()
// const bodyParser = require('body-parser')
// const cors = require('cors')
// const mongoose = require('mongoose')
// const blogsRouter = require('./mongos')

// mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
//         .then(result => console.log('Connected to MongoDB'))
//         .catch(error => console.log(error))

// app.use(cors())
// app.use(express.static('build'))
// app.use(bodyParser.json())
// app.use('/api/blogs', blogsRouter)
        
// app.listen(process.env.PORT, () => {
//   console.log(`Server running on port: ${process.env.PORT}`)
// })

const app = require('./app') // the actual Express app
const http = require('http')
const config = require('./utils/config')

const server = http.createServer(app)

server.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`)
})