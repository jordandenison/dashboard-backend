const { authenticate } = require('@feathersjs/authentication').hooks
const { BadRequest, Forbidden } = require('@feathersjs/errors')

const preventBulkOperations = () =>
  hook => {
    if (Array.isArray(hook.data)) {
      throw new BadRequest('Bulk operations not permitted')
    }
  }

const restrictToAdmin = () =>
  hook => {
    if (!hook.params.user || hook.params.user.role === 'admin') {
      return hook
    }

    throw new Forbidden('Only admins can perform this action')
  }

const restrictToAdminAndOwners = () =>
  hook => {
    if (!hook.params.user || hook.params.user.role === 'admin') {
      return hook
    }

    if (hook.params.query) {
      hook.params.query.id = hook.params.user.id
    } else {
      hook.params.query = { id: hook.params.user.id }
    }

    return hook
  }

const filterFindForUsers = () =>
  hook => {
    if (!hook.params.user || hook.params.user.role === 'admin') {
      return hook
    }

    if (hook.params.query) {
      hook.params.query.id = hook.params.user.id
    } else {
      hook.params.query = { id: hook.params.user.id }
    }

    return hook
  }

const restrictPromoteToAdminToAdmins = () =>
  hook => {
    if (!hook.params.user) {
      return hook
    }

    if (hook.data.role === 'admin' && hook.params.user.role !== 'admin') {
      throw new Forbidden('Only admins can promote users to admins')
    }

    return hook
  }

const search = () =>
  hook => {
    if (hook.params.query.search) {
      const search = { $like: `%${hook.params.query.search}%` }
      hook.params.query = Object.assign({}, hook.params.query, {
        $or: [
          { email: search },
          { firstName: search },
          { lastName: search }
        ]
      })

      delete hook.params.query.search
    }

    return hook
  }

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [ filterFindForUsers(), search() ],
    get: [ restrictToAdminAndOwners() ],
    create: [ preventBulkOperations(), restrictToAdmin() ],
    update: [],
    patch: [ preventBulkOperations(), restrictToAdminAndOwners(), restrictPromoteToAdminToAdmins() ],
    remove: [ preventBulkOperations(), restrictToAdminAndOwners() ]
  },

  after: {
    all: [ ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
}
