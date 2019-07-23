const compress = require('compression')
const helmet = require('helmet')
const cors = require('cors')
const logger = require('./logger')

const feathers = require('@feathersjs/feathers')
const configuration = require('@feathersjs/configuration')
const express = require('@feathersjs/express')
const socketio = require('@feathersjs/socketio')
const redisAdapter = require('socket.io-redis')

const middleware = require('./middleware')
const services = require('./services')
const appHooks = require('./app.hooks')

const authentication = require('./authentication')
const sequelize = require('./sequelize')

const app = express(feathers())

// Load app configuration
app.configure(configuration())
// Enable security, CORS, compression, favicon and body parsing
app.use(helmet())
app.use(cors())
app.use(compress())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Set up Plugins and providers
app.configure(express.rest())

app.configure(socketio(io => {
  io.adapter(redisAdapter({ host: 'redis', port: 6379 }))
  app.set('io', io)
}))

// Configure other middleware (see `middleware/index.js`)
app.configure(sequelize)
app.configure(middleware)
app.configure(authentication)
// Set up our services (see `services/index.js`)
app.configure(services)

app.get('/health', (req, res) => res.send('OK'))

app.get('/robots.txt', (req, res) => {
  res.type('text/plain')
  res.send(`User-agent: *\nDisallow:${process.env.ROBOTS_INDEX === 'true' ? '' : ' /'}\n`)
})

// Configure a middleware for 404s and the error handler
app.use(express.notFound())
app.use(express.errorHandler({ logger }))

app.hooks(appHooks)

module.exports = app
