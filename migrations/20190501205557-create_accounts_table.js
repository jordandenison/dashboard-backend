'use strict'

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('accounts', {
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
      indexes: [ { unique: true, fields: ['name'] } ]
    }),

  down: (queryInterface, Sequelize) => queryInterface.dropTable('accounts')
}
