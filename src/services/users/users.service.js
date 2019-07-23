const createService = require('feathers-sequelize')
const createModel = require('models/users.model')
const hooks = require('services/users/users.hooks')

module.exports = function () {
  const app = this
  const Model = createModel(app)
  const paginate = app.get('paginate')

  const options = {
    name: 'users',
    Model,
    paginate
  }

  // Initialize our service with any options it requires
  app.use('/users', createService(options))

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('users')

  service.hooks(hooks)
}
