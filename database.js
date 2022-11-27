const { defaultSlots, initialSaves, guildSaveSlots } = require('./config.json');
const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', "", "", {
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
      defaultValue: initialSaves
    },
    slots: {
      type: Sequelize.INTEGER,
      defaultValue: defaultSlots
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
      type: Sequelize.STRING,
      defaultValue: "0"
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
    defaultValue: guildSaveSlots,
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

module.exports = { Counters, Data }