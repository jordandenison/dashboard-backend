require('app-module-path').addPath(require('path').join(__dirname, '../../src'))

const test = require('ava')
const request = require('supertest')
const Promise = require('bluebird')
const factory = require('../factory')

const app = require('app')

const sequelizeClient = app.get('sequelizeClient')

const models = sequelizeClient.models
Object.keys(models).forEach(name => {
  if ('associate' in models[name]) {
    models[name].associate(models)
  }
})

const emailsByRole = {
  admin: 'admin-user-tests@boilerplatetest.com',
  user: 'user-user-tests@boilerplatetest.com'
}
const password = 'test'
const strategy = 'local'

let account
const accessTokensByRole = {}
const usersByRole = {}

const createaccount = async () => {
  account = await app.service('accounts').create({ name: 'test' })
}

const createUser = async (role, email) => {
  const user = Object.assign({}, factory.build('user'), { email: email || emailsByRole[role], password, role, accountId: account.id })

  const createdUser = await app.service('users').create(user)

  if (!usersByRole[role]) {
    usersByRole[role] = createdUser
  }

  return createdUser
}

let server

test.before(async () => {
  await createaccount()
  await sequelizeClient.sync()
  await new Promise(resolve => {
    server = app.listen(0, resolve)
  })

  await createUser('admin')
  await createUser('user')
})

test.serial('admin: POST /authentication', async t => {
  const res = await request(server)
    .post('/authentication')
    .send({ email: emailsByRole.admin, password, strategy })

  t.is(res.status, 201)
  t.true(res.body.accessToken.length > 1)

  accessTokensByRole.admin = `Bearer ${res.body.accessToken}`
})

test.serial('user: POST /authentication', async t => {
  const res = await request(server)
    .post('/authentication')
    .send({ email: emailsByRole.user, password, strategy })

  t.is(res.status, 201)
  t.true(res.body.accessToken.length > 1)

  accessTokensByRole.user = `Bearer ${res.body.accessToken}`
})

test('admin: GET /users fetches all users', async t => {
  const res = await request(server)
    .get('/users')
    .set({ Authorization: accessTokensByRole.admin })

  t.is(res.status, 200)
  t.true(res.body.data.length >= 2)
})

test('user: GET /users fetches own user only and omits password', async t => {
  const res = await request(server)
    .get('/users')
    .set({ Authorization: accessTokensByRole.user })

  t.is(res.status, 200)
  t.is(res.body.data.length, 1)
  t.is(res.body.data[0].id, usersByRole.user.id)
  t.falsy(res.body.data[0].password)    
})

test('admin: GET /users/:id fetches own user and omits password', async t => {
  const res = await request(server)
    .get(`/users/${usersByRole.admin.id}`)
    .set({ Authorization: accessTokensByRole.admin })

  t.is(res.status, 200)
  t.falsy(res.body.password)
})

test('admin: GET /users/:id fetches another user and omits password', async t => {
  const res = await request(server)
    .get(`/users/${usersByRole.user.id}`)
    .set({ Authorization: accessTokensByRole.admin })

  t.is(res.status, 200)
  t.falsy(res.body.password)
})

test('user: GET /users/:id fetches own user', async t => {
  const res = await request(server)
    .get(`/users/${usersByRole.user.id}`)
    .set({ Authorization: accessTokensByRole.user })

  t.is(res.status, 200)
})

test('user: GET /users/:id cannot fetch another user', async t => {
  const res = await request(server)
    .get(`/users/${usersByRole.admin.id}`)
    .set({ Authorization: accessTokensByRole.user })
    
  t.is(res.status, 404)
})

test('admin: POST /users creates a user', async t => {
  const res = await request(server)
    .post('/users')
    .set({ Authorization: accessTokensByRole.admin })
    .send(Object.assign({}, factory.build('user'), { email: 'user-user2@boilerplate.test', role: 'user', password, accountId: account.id }))

  t.is(res.status, 201)
})

test('admin: POST /users cannot create a user with existing email address', async t => {
  const res = await request(server)
    .post('/users')
    .set({ Authorization: accessTokensByRole.admin })
    .send(Object.assign({}, factory.build('user'), { email: usersByRole.user.email, role: 'user', password, accountId: account.id }))

  t.is(res.status, 400)
})

test('admin: POST /users creates another admin user', async t => {
  const res = await request(server)
    .post('/users')
    .set({ Authorization: accessTokensByRole.admin })
    .send(Object.assign({}, factory.build('user'), { email: 'admin2@boilerplate.test', role: 'admin', password, accountId: account.id }))

  t.is(res.status, 201)
})

test('user: POST /users cannot create an admin', async t => {
  const res = await request(server)
    .post('/users')
    .set({ Authorization: accessTokensByRole.user })
    .send(Object.assign({}, factory.build('user'), { email: 'noncreatedadmin2@boilerplate.test', role: 'admin', password, accountId: account.id }))

  t.is(res.status, 403)
})

test('user: POST /users cannot create another user', async t => {
  const res = await request(server)
    .post('/users')
    .set({ Authorization: accessTokensByRole.user })
    .send(Object.assign({}, factory.build('user'), { email: 'noncreateduser2@boilerplate.test', role: 'user', password, accountId: account.id }))

  t.is(res.status, 403)
})

test('admin: PATCH /users/:id upgrades another user to admin', async t => {
  const user = await createUser('user', 'dynamic-test-user1@boilerplate.test')

  const res = await request(server)
    .patch(`/users/${user.id}`)
    .set({ Authorization: accessTokensByRole.admin })
    .send({ role: 'admin' })

  t.is(res.status, 200)
})

test('user: PATCH /users/:id cannot upgrade another user to admin', async t => {
  const user = await createUser('user', 'dynamic-test-user2@vfy.test')
  const res = await request(server)
    .patch(`/users/${user.id}`)
    .set({ Authorization: accessTokensByRole.user })
    .send({ role: 'admin' })

  t.is(res.status, 403)
})

test('user: PATCH /users/:id cannot upgrade own user to admin', async t => {
  const res = await request(server)
    .patch(`/users/${usersByRole.user.id}`)
    .set({ Authorization: accessTokensByRole.user })
    .send({ role: 'admin' })

  t.is(res.status, 403)
})

test('user: PATCH /userss can update their own password', async t => {
  const res = await request(server)
    .patch(`/users/${usersByRole.user.id}`)
    .set({ Authorization: accessTokensByRole.user })
    .send({ password: 'Vfitest!!' })

  t.is(res.status, 200)
})
