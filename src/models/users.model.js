const Sequelize = require('sequelize')

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient')
  const users = sequelizeClient.define('users', {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4
    },
    firstName: Sequelize.STRING(60),
    lastName: Sequelize.STRING(60),
    email: {
      type: Sequelize.STRING(255),
      allowNull: false,
      unique: true
    },
    role: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'user',
      validate: {
        is: /^(admin|user)$/
      }
    },
    accountId: {
      type: Sequelize.UUID,
      references: { model: 'accounts', key: 'id' },
      allowNull: false
    },
    password: Sequelize.STRING(255),
    lastLoginDate: Sequelize.DATE,
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
  }, {
    hooks: {
      beforeCount (options) {
        options.raw = true
      }
    }
  })

  return users
}
