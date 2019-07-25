const createInitialUsers = async app => {
  const { data } = await app.service('accounts').find({ query: { name: 'dashboard' } })

  let [account] = data
  if (!account) {
    account = await app.service('accounts').create({ name: 'dashboard' })
  }

  const { total } = await app.service('users').find({ query: { email: 'test@test.com' } })

  if (!total) {
    await app.service('users').create({ email: 'test@test.com', password: 'test', accountId: account.id })
  }

  const { total: total2 } = await app.service('users').find({ query: { email: 'test2@test.com' } })

  if (!total2) {
    await app.service('users').create({ email: 'test2@test.com', password: 'test', accountId: account.id })
  }
}

module.exports = createInitialUsers
