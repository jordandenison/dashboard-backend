const { disallow } = require('feathers-hooks-common')
const log = require('./hooks/log')

const setCreatedAt = () =>
  hook => {
    if (!hook.data.createdAt) {
      hook.data.createdAt = new Date()
    }

    return hook
  }

const setUpdatedAt = () =>
  hook => {
    if (!hook.data.updatedAt) {
      hook.data.updatedAt = new Date()
    }

    return hook
  }

const setAccountAndUserId = () =>
  hook => {
    if (hook.params.user) {
      hook.data.userId = hook.params.user.id
      hook.data.accountId = hook.params.user.accountId
    }

    return hook
  }

module.exports = {
  before: {
    all: [ log() ],
    find: [],
    get: [],
    create: [ setCreatedAt(), setAccountAndUserId() ],
    update: [ disallow() ],
    patch: [ setUpdatedAt() ],
    remove: []
  },

  after: {
    all: [ log() ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [ log() ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
}
