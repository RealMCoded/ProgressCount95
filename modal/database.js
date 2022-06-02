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
    defaultValue: 2
  }
});

const Counters = sequelize.define('counters', {
    userID:{
      type: Sequelize.STRING,
    },
    numbers: {
      type: Sequelize.NUMBER,
      defaultValue: 0
    },
    wrongNumbers: {
      type: Sequelize.NUMBER,
      defaultValue: 0
    }
});

const Ruins = sequelize.define('ruins', {
  userID:{
    type: Sequelize.STRING,
  },
  ruin: {
    type: Sequelize.NUMBER,
    defaultValue: 0
  }
});

const Bans = sequelize.define('banned', {
  userID:{
    type: Sequelize.STRING,
  },
  reason: {
    type: Sequelize.STRING,
    defaultValue: "No reason given."
  }
});

const Data = sequelize.define('data', {
  name:{
    type: Sequelize.STRING,
    defaultValue: 0
  },
  value: {
    type: Sequelize.STRING,
    defaultValue: "0"
  }
});

module.exports = { Saves, Counters, Bans, Ruins, Data }