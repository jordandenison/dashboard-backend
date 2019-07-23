const Sequelize = require('sequelize')

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient')
  const accounts = sequelizeClient.define('accounts', {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4
    },
    name: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
  }, {
    hooks: {
      beforeCount (options) {
        options.raw = true
      }
    }
  })

  return accounts
}
