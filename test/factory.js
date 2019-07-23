const faker = require('faker')

const models = {
  user () {
    const firstName = faker.name.firstName()
    const lastName = faker.name.lastName()

    return {
      firstName,
      lastName,
      role: 'user'
    }
  }
}

module.exports = {
  build (model) {
    return models[model]()
  }
}
