const { Client } = require('pg')
const { NODE_ENV, DB_URI: connectionString, TEST_DB_NAME } = process.env

if (NODE_ENV === 'production') {
  throw new Error('Test cleanup script should not be run in production')
}

if (!connectionString) {
  throw new Error('DB_URI not defined')
}

if (!TEST_DB_NAME) {
  throw new Error('TEST_DB_NAME not defined')
}

const client = new Client({ connectionString })

client.connect()

client.query(`DROP DATABASE IF EXISTS "${TEST_DB_NAME}"`, () => client.end())
