const createService = require('feathers-sequelize')
const createModel = require('models/accounts.model')
const hooks = require('services/accounts/accounts.hooks')

module.exports = function () {
  const app = this
  const Model = createModel(app)
  const paginate = app.get('paginate')

  const options = {
    name: 'accounts',
    Model,
    paginate
  }

  // Initialize our service with any options it requires
  app.use('/accounts', createService(options))

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('accounts')

  service.hooks(hooks)
}
