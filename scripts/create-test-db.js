const { DB_URI: connectionString, TEST_DB_NAME } = process.env

const { Client } = require('pg')
const client = new Client({ connectionString })

client.connect()

client.query(`CREATE DATABASE "${TEST_DB_NAME}"`, () => client.end())
