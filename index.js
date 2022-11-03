// import libs
const fs = require('node:fs');
const { Client, Collection, Intents } = require('discord.js');
const mathx = require('math-expression-evaluator');

// import files
const { token, countingCh, useCustomEmoji, numbersRequiredForFreeSave, freeSave, saveClaimCooldown, customEmojiList, longMessageEasterEggContent, longMessageEasterEgg, ruinDelay, nerdstatExecutor, guildId, logRuins, logSaveUses } = require('./config.json');
const { validateExpression } = require('./utils/validateExpression.js')
const rules = require("./messages/rules.js")
const logger = require("./utils/logger.js")

// create discord client
const client = new Client({ ws: { properties: { browser: "Discord iOS" } }, intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });
client.db = require('./modal/database.js')

// re define console functions
console.log = logger.log;
console.warn = logger.warn;
console.error = logger.error;

// import commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
client.commands = new Collection(
	commandFiles.map(command => {
		const command = require(`./commands/${file}`);
		[command.data.name, command]
	})
);







const recentCountRuiners = new Set();

var canAllCount = true
var lastCounterId
var serverSaves
var guildDB
var highscore


client.once('ready', async () => {
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
});

//All slash commands. check "commands" folder
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand() || !client.commands.has(interaction.commandName)) return;
	const command = client.commands.get(interaction.commandName);

	try {
		await command.execute(interaction);
	} catch (error) {
		console.log(`${error}\n\n`)
		if (!nerdstatExecutor.includes(interaction.user.id)) {
			await interaction.reply({ content: `if you are seeing this, one of the devs messed up somehow. send this error to them plz :)\n\n\`\`\`${error}\`\`\``, ephemeral: true })
		} else {
			await interaction.reply({ content: `Something bad happened! \n\n\`\`\`${error}\`\`\``, ephemeral: true })
		}
	}
});

function useSave(lecountr, message, serverSaves, numb, thec, lastCounterId){
	if (lecountr.saves >= 10) {
		if (useCustomEmoji) { message.react(customEmojiList.warn) } else { message.react('⚠️') }
		lecountr.decrement('saves', { by: 10 })
		message.reply(`${message.author} almost ruined the count, but one of their saves were used!\n${message.author.tag} now has **${(lecountr.saves - 10) / 10}** saves remaining.\nThe next number is **${numb + 1}** | **You cannot count twice in a row!**`)
		if (logSaveUses) console.log(`${message.author.tag} used one of their saves, now they have ${(lecountr.saves - 10) / 10}`)
	} else if (serverSaves >= 1) {
		if (useCustomEmoji) { message.react(customEmojiList.warn) } else { message.react('⚠️') }
		serverSaves--
		message.reply(`${message.author} almost ruined the count, but a server save was used!\n**${serverSaves}** server saves remain.\nThe next number is **${numb + 1}** | **You cannot count more than one time in a row**!`)
		if (logSaveUses) console.log(`${message.author.tag} used a server save, now the server has ${serverSaves}}!`)
	} else {
		if (useCustomEmoji) { message.react(customEmojiList.ruin) } else { message.react('❌') }
		message.reply(`${message.author} ruined the count!\nThe next number was **${numb + 1}**, but they said **${thec}**! | **You cannot count more than one time in a row**!`)
		numb = 0
		lastCounterId = "0"
		guildDB.update({ lastCounterID: "0" })
		if (logRuins) console.log(`${message.author.tag} ruined the count at ${numb}!`)
	}
}

client.on('messageCreate', async message => {
	// return if message is outside of desired parameters
	if (message.author.bot || message.channel.id !== countingCh || !canAllCount || (message.type !== "DEFAULT" || message.type !== "REPLY")) return;
	if (validateExpression(message.content.split(" ")[0]) && message.attachments.size == 0 && message.stickers.size == 0 && message.content.toUpperCase() !== "INFINITY") return message.react(useCustomEmoji ? customEmojiList.ignored : "⛔");
	if ((message.createdAt - message.author.createdAt) < 1000 * 60 * 60 * 24 * 7) {
		message.reply("⚠️ **Your account is too young to count! Your account must be 7 days old to count.**")
		return message.react(useCustomEmoji ? customEmojiList.ignored : "⛔")
	}

	// get user from database and deal with new/banned user
	let [lecountr, isNewCounter] = await client.db.Counters.findOrCreate({ where: { userID: message.author.id } });
	if (isNewCounter) message.reply(rules.text);
	if (lecountr.banned) return message.react(useCustomEmoji ? customEmojiList.ignored : "⛔");
	
	
	let guildDB = await client.db.Data.findOne({ where: { guildID: interaction.guild.id } }) //i can run this instead of findOrCreate because it already exists by now lol
	numb = guildDB.count
	highscore = guildDB.highscore
	serverSaves = guildDB.guildSaves


	//check if first string in message is a math expression
	try {
		var thec = mathx.eval(message.content.split(' ')[0])
	} catch (e) { return }
	if (isNaN(thec)) return;





	if (lastCounterId !== message.author.id) {
		if (thec == String(numb + 1)) {
			if (useCustomEmoji) {
				if (thec in customEmojiList.other) {
					message.react(customEmojiList.other[thec])
				} else {
					let hasReacted = 0
					for (const [key, value] of Object.entries(customEmojiList.milestones).reverse()) {
						let remainder = thec % +key
						if (remainder === 0) {
							message.react(value)
							hasReacted = 1
							break;
						}
					}
					for (const [key, value] of Object.entries(customEmojiList.endings)) {
						if (thec.toString().endsWith(key)) {
							message.react(value)
							hasReacted = 1
							break;
						}
					}
					if (!hasReacted) {
						if (thec.toString().length > 2 && thec.toString() == thec.toString().split('').reverse().join('')) {
							message.react(customEmojiList.palindrome)
						} else if (highscore < thec) {
							message.react(customEmojiList.highscore)
						} else {
							message.react(customEmojiList.normal)
						}
					}
				}
			} else {
				switch (thec) {
					case 100: message.react("💯"); break;
					case 420: message.react("🌿"); break;
					default: if (highscore < thec) message.react("☑"); else message.react("✅"); break;
				}
			}
			numb++
			if (highscore < numb) highscore = numb;
			lastCounterId = message.author.id
			guildDB.update({ lastCounterID: message.author.id })
			lecountr.increment('numbers');

			if (lecountr.numbers % numbersRequiredForFreeSave == 0) { //every 50(by default) numbers
				//lecountr.increment('saves', { by: freeSave.toFixed(1) })
				if (lecountr.saves >= lecountr.slots * 10) return;
				let freeSaveClamped
				if ((lecountr.saves + freeSave) > lecountr.slots * 10) {
					freeSaveClamped = lecountr.slots * 10 - lecountr.saves
					console.log(`clamped: ${freeSaveClamped}`)
				} else freeSaveClamped = freeSave
				lecountr.update({ saves: (lecountr.saves + freeSaveClamped) })
				lecountr = await client.db.Counters.findOne({ where: { userID: message.author.id } });
			}
		} else {
			canAllCount = false;
			setTimeout(() => {
				canAllCount = true;
			}, ruinDelay);
			if (message.content.length >= 1500) {
				if (useCustomEmoji) { message.react(customEmojiList.ignored) } else { message.react("⛔") }
				if (longMessageEasterEgg) {
					message.reply(longMessageEasterEggContent)
				}
			} else {
				useSave(lecountr, message, serverSaves, numb, thec, lastCounterId)
			}
			lecountr.increment('wrongNumbers');
		}
	} else {
		canAllCount = false;
		setTimeout(() => {
			canAllCount = true;
		}, 3000);

		useSave(lecountr, message, serverSaves, numb, thec, lastCounterId)	

		lecountr.increment('wrongNumbers');
	}
	guildDB.update({ count: numb, guildSaves: serverSaves, highscore: highscore })
});


client.on('messageDelete', async message => {
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
});

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
					console.warn(`Unable to DM user with ID ${counter.get('userID')}, notifying them in counting channel!`)
					//send notification to counting channel
					client.channels.cache.get(countingCh).send(`${user}, Your save is ready! Use </saves claim:${savesClaimCommandID}> to claim it!`)
				})
		}
	})
}, 1000);

process.on('uncaughtException', (error, origin) => {
	console.log(`❌ Uncaught exception\n-----\n${error.stack}\n-----\nException origin\n${origin}`)
})

process.on('unhandledRejection', (reason, promise) => {
	console.log(`❌ Unhandled Rejection\n-----\n${promise}\n-----\nReason\n${reason}`)
})

client.login(token);