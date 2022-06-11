const { SQL_USER, SQL_PASS } = require('../config.json');
const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', SQL_USER, SQL_PASS, {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  storage: 'database.sqlite'
})

const Counters = sequelize.define('counters', {
    userID:{
      type: Sequelize.STRING,
      primaryKey: true
    },
    numbers: {
      type: Sequelize.NUMBER,
      defaultValue: 0
    },
    wrongNumbers: {
      type: Sequelize.NUMBER,
      defaultValue: 0
    }, 
    saves: {
      type: Sequelize.DOUBLE,
      defaultValue: 2
    },
    slots: {
      type: Sequelize.INTEGER,
      defaultValue: 5
    },
    banned: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }, 
    banReason: {
      type: Sequelize.STRING,
      defaultValue: "No reason provided."
    },
    saveCooldown: {
      type: Sequelize.DATE,
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

const Data = sequelize.define('data', {
  guildID:{
    type: Sequelize.STRING,
    primaryKey: true
  },
  count: {
    type: Sequelize.BIGINT,
    defaultValue: 0
  }, 
  guildSaves: {
    type: Sequelize.DOUBLE,
    defaultValue: 3,
  },
  lastCounterID: {
    type: Sequelize.STRING,
    defaultValue: "0"
  },
  highscore: {
    type: Sequelize.BIGINT,
    defaultValue: 0
  }
});

module.exports = { Counters, Ruins, Data }