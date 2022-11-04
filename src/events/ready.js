// import files
const { useCustomEmoji, guildId } = require('../config.json');
const logger = require("../utils/logger.js")

module.exports.eventLogic = async (message, client) => {
	//sync database tables
	await client.db.Counters.sync()
	await client.db.Data.sync()
	await client.db.Data.findOrCreate({ where: { guildID: guildId } })

	logger.log(`✅ Signed in as ${client.user.tag}! \n`);
	logger.log(useCustomEmoji ? "Custom Emoji support is on! Some emojis may fail to react if the bot is not in the server with the emoji." : "Custom Emoji support is off! No custom emojis will be used.")
}

module.exports.recurring = false