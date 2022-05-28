const { SQL_USER, SQL_PASS } = require('../config.json');
const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', SQL_USER, SQL_PASS, {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  storage: 'database.sqlite'
})

const Saves = sequelize.define('saves', {
  userID:{
    type: Sequelize.STRING,
  },
  saves: {
    type: Sequelize.NUMBER,
    defaultValue: 0
  }
});

const Counters = sequelize.define('counters', {
    userID:{
      type: Sequelize.STRING,
    },
    numbers: {
      type: Sequelize.NUMBER,
      defaultValue: 0
    }
});

module.exports = { Saves, Counters }