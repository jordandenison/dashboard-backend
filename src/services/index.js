const accounts = require('./accounts/accounts.service.js')
const users = require('./users/users.service.js')

module.exports = function (app) {
  app.configure(accounts)
  app.configure(users)
}
