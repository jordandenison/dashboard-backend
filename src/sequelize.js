const Sequelize = require('sequelize')
const { NODE_ENV, TEST_DB_NAME } = process.env

module.exports = app => {
  const uri = NODE_ENV === 'test' ? process.env.DB_URI.replace(/boilerplate$/, TEST_DB_NAME) : process.env.DB_URI

  const sequelize = new Sequelize(uri, {
    dialect: 'postgres',
    logging: false,
    define: { freezeTableName: true }
  })

  app.set('sequelizeClient', sequelize)
}
