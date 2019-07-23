require('app-module-path').addPath(__dirname)

const logger = require('./logger')
const app = require('./app')
const realtime = require('lib/realtime')
const { delay } = require('lib/util')
const createInitialUsers = require('../scripts/create-initial-users')
const port = app.get('port')

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
)

const waitForDatabaseConnection = async () => {
  if (!app.service('users').Model) {
    await delay(250)
    return waitForDatabaseConnection()
  }
}

const listen = async () => {
  await waitForDatabaseConnection()

  realtime.init(app)

  await createInitialUsers(app)

  const server = app.listen(port)

  server.on('listening', () => {
    logger.info('Boilerplate started on http://%s:%d', app.get('host'), port)
  })
}

listen()
