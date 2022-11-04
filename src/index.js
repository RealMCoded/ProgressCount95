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
	commandFiles.map(command => {
		const command = require(`./commands/${file}`);
		return [command.data.name, command]
	})
);

// load events
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
eventFiles.map(event => {
	const {eventLogic, recurring} = require(`./events/${event}`);
	client[recurring ? "on" : "once"]('interactionCreate', eventLogic.bind(null, client));
})


//check every second asynchronously
setInterval(async () => {
	const n = Math.floor(Date.now() / 1000)

	//get list of all counters
	let counters = await client.db.Counters.findAll({ attributes: ['userID', 'saveCooldown'] })

	//loop through all counters
	counters.map(counter => {
		const lastBeg = parseInt(counter.get('saveCooldown'))
		if (n === (lastBeg + saveClaimCooldown)){
			let user = await client.users.fetch(counter.get('userID'))
			let guild = await client.guilds.cache.get(guildId)
			let savesClaimCommandID = await guild.commands.fetch()
			savesClaimCommandID = savesClaimCommandID.find(c => c.name == "saves").id
			//check if we can dm the user
			user.send(`Your save is ready! Use </saves claim:${savesClaimCommandID}> to claim it!`)
				.catch(err => {
					logger.warn(`Unable to DM user with ID ${counter.get('userID')}, notifying them in counting channel!`)
					//send notification to counting channel
					client.channels.cache.get(countingCh).send(`${user}, Your save is ready! Use </saves claim:${savesClaimCommandID}> to claim it!`)
				})
		}
	})
}, 1000);

process.on('uncaughtException', (error, origin) => {
	logger.log(`❌ Uncaught exception\n-----\n${error.stack}\n-----\nException origin\n${origin}`)
})

process.on('unhandledRejection', (reason, promise) => {
	logger.log(`❌ Unhandled Rejection\n-----\n${promise}\n-----\nReason\n${reason}`)
})

client.login(token);