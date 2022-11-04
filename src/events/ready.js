// import files
const { useCustomEmoji, guildId } = require('./config.json');
const logger = require("./utils/logger.js")

// re define console functions
console.log = logger.log;
console.warn = logger.warn;
console.error = logger.error;


var lastCounterId
var serverSaves
var guildDB
var highscore

module.exports.eventLogic = async (message, client) => {
    //sync database tables
	await client.db.Counters.sync()
	await client.db.Data.sync()

	let guild = await client.guilds.fetch(guildId)
	let [localDB] = await client.db.Data.findOrCreate({ where: { guildID: guild.id } })
	numb = localDB.count
	highscore = localDB.highscore
	serverSaves = localDB.guildSaves
	lastCounterId = localDB.lastCounterID
	console.log(`✅ Signed in as ${client.user.tag}! \n`);
	if (useCustomEmoji) { console.log("Custom Emoji support is on! Some emojis may fail to react if the bot is not in the server with the emoji.") } else { console.log("Custom Emoji support is off! No custom emojis will be used.") }
	client.user.setActivity(`counting | ${numb}`, { type: 'COMPETING' });
	guildDB = localDB

	setInterval(() => {
		client.user.setActivity(`counting | ${numb}`, { type: 'COMPETING' });
	}, 90000);
}

module.exports.recurring = false