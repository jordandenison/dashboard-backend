require('app-module-path').addPath(require('path').join(__dirname, '../src'))

const test = require('ava')
const request = require('supertest')

const app = require('app')

test('health check route', t =>
  request(app)
    .get('/health')
    .then(res => t.is(res.status, 200)))
