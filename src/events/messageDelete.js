// import files
const { validateExpression } = require('../utils/validateExpression.js')

module.exports.eventLogic = async (message, client) => {
	// return if message is outside of desired parameters
	if (message.channel.id !== countingCh && message.author.bot && message.attachments.size !== 0 && message.stickers.size !== 0 || (message.type !== "DEFAULT" || message.type !== "REPLY") || !validateExpression(message.content.split(" ")[0]) || message.content.toUpperCase() === "INFINITY") return

	// return if counter is banned
	const [lecountr] = await client.db.Counters.findOrCreate({ where: { userID: message.author.id } });
	if (lecountr.banned) return;

	// return if number sent is not a number
	if (isNaN(message.content.split(' ')[0])) return; 

	// get current number and send deleted message
	const guildDB = await client.db.Data.findOne({ where: { guildID: interaction.guild.id } }) //i can run this instead of findOrCreate because it already exists by now lol
	message.channel.send(`${message.author} deleted their number! The current number is **${guildDB.count}**.`)
}

module.exports.recurring = true