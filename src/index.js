// import libs
const fs = require('node:fs');
const { Client, Collection, Intents } = require('discord.js');

// import files
const { token, countingCh, saveClaimCooldown, guildId } = require('./config.json');
const logger = require("./utils/logger.js")

// create discord client
const client = new Client({ ws: { properties: { browser: "Discord iOS" } }, intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });
client.db = require('./modal/database.js')

// import commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
client.commands = new Collection(
	commandFiles.map(commandFile => {
		const command = require(`./commands/${commandFile}`);
		return [command.data.name, command]
	})
);

// load events
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
eventFiles.map(event => {
	const { eventLogic, recurring } = require(`./events/${event}`);
	client[recurring ? "on" : "once"]('interactionCreate', eventLogic.bind(null, client));
})


//check every 90 seconds asynchronously
setInterval(async () => {
	const guildDB = await client.db.Data.findOne({ where: { guildID: guildId } })
	client.user.setActivity(`counting | ${guildDB.count}`, { type: 'COMPETING' });

	const now = Math.floor(Date.now() / 1000)
	const guild = await client.guilds.cache.get(guildId)

	//get list of all counters
	const counters = await client.db.Counters.findAll({ attributes: ['userID', 'saveCooldown'] })

	//loop through all counters
	counters.map(async counter => {
		const lastBeg = parseInt(counter.get('saveCooldown'))
		if (now === (lastBeg + saveClaimCooldown)) {
			const user = await client.users.fetch(counter.get('userID'))

			//check if we can dm the user
			user.send(`Your save is ready! Use </saves claim:${guild.commands.get("saves").id}> to claim it!`)
				.catch(err => {
					logger.warn(`Unable to DM user with ID ${counter.get('userID')}, notifying them in counting channel!`)
					//send notification to counting channel
					client.channels.cache.get(countingCh).send(`${user}, Your save is ready! Use </saves claim:${guild.commands.get("saves").id}> to claim it!`)
				})
		}
	})
}, 1000 * 90);

process.on('uncaughtException', (error, origin) => {
	logger.log(`❌ Uncaught exception\n-----\n${error.stack}\n-----\nException origin\n${origin}`)
})

process.on('unhandledRejection', (reason, promise) => {
	logger.log(`❌ Unhandled Rejection\n-----\n${promise}\n-----\nReason\n${reason}`)
})

client.login(token);