const fs = require('node:fs');
const Sequelize = require('sequelize');
const { Client, Collection, Intents, WebhookClient } = require('discord.js');
const { token, countingCh, useCustomEmoji, numbersRequiredForFreeSave, freeSave, saveClaimCooldown, logHook, redirectConsoleOutputToWebhook, customEmojiList, longMessageEasterEggContent, longMessageEasterEgg, ruinDelay, nerdstatExecutor, guildId, logRuins, logSaveUses, enableRulesFile, showRulesOnFirstCount, status, fallbackToChannelIfDMFails } = require('./config.json');
const mathx = require('math-expression-evaluator');
const client = new Client({ ws: { properties: { browser: "Discord iOS" }}, intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });
const { validateExpression } = require('./Util.js')

//database shit
const sequelize = new Sequelize('database', "", "", {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
});
client.db = require('./database.js')

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

//redef some console functions here
console.log = function(e) {
	try {
		if (redirectConsoleOutputToWebhook) {
			let webhookClient = new WebhookClient({ url: logHook });
			webhookClient.send(`\`\`\`\n${e}\n\`\`\``);
		}
	} catch(err) {
		process.stdout.write(`Unable to redirect output: ${err}\n`);
	}
	process.stdout.write(`${e}\n`);
}

console.warn = function(e) {
	try {
		if (redirectConsoleOutputToWebhook) {
			let webhookClient = new WebhookClient({ url: logHook });
			webhookClient.send(`\`\`\`\n[WARN] ${e}\n\`\`\``);
		}
	} catch(err) {
		process.stdout.write(`Unable to redirect output: ${err}\n`);
	}
	process.stdout.write(`[WARN] ${e}\n`);
}

console.error = function(e) {
	try {
		if (redirectConsoleOutputToWebhook) {
			let webhookClient = new WebhookClient({ url: logHook });
			webhookClient.send(`\`\`\`\n[ERROR] ${e}\n\`\`\``);
		}
	} catch(err) {
		process.stdout.write(`Unable to redirect output: ${err}\n`);
	}
	process.stdout.write(`[ERROR] ${e}`);
}

const recentCountRuiners= new Set();

var canAllCount = true
var lastCounterId, serverSaves, guildDB, highscore, streak
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

client.once('ready', async () => {
	//sync database tables
	await client.db.Counters.sync()
	await client.db.Data.sync()

	let guild = await client.guilds.fetch(guildId)
	let [localDB, ]= await client.db.Data.findOrCreate({ where: { guildID: guild.id }}) 
	numb = localDB.count
	highscore = localDB.highscore
	serverSaves = localDB.guildSaves
	lastCounterId = localDB.lastCounterID
	streak = localDB.streak
	console.log(`✅ Signed in as ${client.user.tag}! \n`);
	if (useCustomEmoji) {console.log("Custom Emoji support is on! Some emojis may fail to react if the bot is not in the server with the emoji.")} else {console.log("Custom Emoji support is off! No custom emojis will be used.")}
	guildDB = localDB

	client.user.setStatus(status.onlineStatus);
	if (status.enableActivity) {
		client.user.setActivity(`${status.activity_name} ${(status.showCurrentNumber ? `| ${numb}` : '')}`, { type: status.activity_type });

		setInterval(() => {
			client.user.setActivity(`${status.activity_name} ${(status.showCurrentNumber ? `| ${numb}` : '')}`, { type: status.activity_type });
		}, 90000);
	}
});

//All slash commands. check "commands" folder
client.on('interactionCreate', async interaction => {
	//if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);

		let guildDB = await client.db.Data.findOne({ where: { guildID: interaction.guild.id} }) //i can run this instead of findOrCreate because it already exists by now lol
		numb = guildDB.count
		streak = guildDB.streak
		highscore = guildDB.highscore
		serverSaves = guildDB.guildSaves
	} catch (error) {
		console.log(`${error}\n\n`)
		await interaction.reply({content: `⚠️Uh Oh! If you're reading this then something bad happened! We've logged the error and will investigate it as soon as possible.\n\n\`\`\`js\n${error}\`\`\``, ephemeral: true})
	}
});

/*
	Counting logic
	TODO: make this it's own separate file.
*/
client.on('messageCreate', async message => {

	if (message.author.bot) return

	if (!canAllCount) return

	switch (message.type){
		case "DEFAULT": break;
		case "REPLY": break;
		default: return;
	}

	if (message.channel.id === countingCh) {
		if (Date.now() - message.author.createdAt < 0) {
			if (validateExpression(message.content.split(" ")[0]) && message.attachments.size == 0 && message.stickers.size == 0 && message.content.toUpperCase() !== "INFINITY") { 
				if (useCustomEmoji) {message.react(customEmojiList.ignored)} else {message.react("⛔")}
				message.reply("⚠️ **Your account is too young to count! Your account must be 7 days old to count.**")
				return;
			}
		  }

		let [lecountr, isNewCounter] = await client.db.Counters.findOrCreate({ where: { userID: message.author.id } });

		if (isNewCounter && enableRulesFile && showRulesOnFirstCount) {
			message.reply(fs.readFileSync('./rules.txt',{encoding:'utf8', flag:'r'}));
		}

		if (lecountr.banned) {
			if (validateExpression(message.content.split(" ")[0]) && message.attachments.size == 0 && message.stickers.size == 0 && message.content.toUpperCase() !== "INFINITY") { 
				if (useCustomEmoji) {message.react(customEmojiList.ignored)} else {message.react("⛔")}
			}
			return;
		}

		//check if first string in message is a math expression
		if (validateExpression(message.content.split(" ")[0]) && message.attachments.size == 0 && message.stickers.size == 0 && message.content.toUpperCase() !== "INFINITY") { //MAKE INFINITY DETECTION BETTER
			try {
				var thec = mathx.eval(message.content.split(' ')[0])
			} catch(e) {return}
			if (!isNaN(thec)) {
				if (lastCounterId !== message.author.id) {
					if (thec == String(numb+1)) {
						if (useCustomEmoji) {
							if (thec in customEmojiList.other) {
								message.react(customEmojiList.other[thec])
							} else {
								let hasReacted=0
								for (const [key,value] of Object.entries(customEmojiList.milestones).reverse()) {
									let remainder = thec % +key
									if (remainder === 0) {
										message.react(value)
										hasReacted = 1 
										break;
									}
								}
								for (const [key,value] of Object.entries(customEmojiList.endings)) {
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
							switch (thec){
								case 100: message.react("💯"); break;
								case 420: message.react("🌿"); break;
								default: if (highscore < thec) message.react("☑"); else message.react("✅"); break;
							}
						}
						numb++
						streak++
						if (highscore < numb) highscore = numb;
						lastCounterId = message.author.id
						guildDB.update({ lastCounterID: message.author.id })
						lecountr.increment('numbers');
						
						if(lecountr.numbers % numbersRequiredForFreeSave == 0) { //every 50(by default) numbers
							//lecountr.increment('saves', { by: freeSave.toFixed(1) })
							if (lecountr.saves >= lecountr.slots*10) return;
							let freeSaveClamped
							if ((lecountr.saves + freeSave) > lecountr.slots*10) {
								freeSaveClamped = lecountr.slots*10 - lecountr.saves 
								console.log(`clamped: ${freeSaveClamped}`)
							} else freeSaveClamped = freeSave
							lecountr.update({saves: (lecountr.saves + freeSaveClamped)})
							lecountr = await client.db.Counters.findOne({ where: { userID: message.author.id } });
						}
					} else {
						canAllCount = false;
							setTimeout(() => {
								canAllCount = true;
							}, ruinDelay);
						if (message.content.length >= 1500){
							if (useCustomEmoji) {message.react(customEmojiList.ignored)} else {message.react("⛔")}
							if (longMessageEasterEgg) {
								message.reply(longMessageEasterEggContent)
							}
						} else if (numb == 0){
							if (useCustomEmoji) {message.react(customEmojiList.warn)} else {message.react('⚠️')}
							message.reply(`${message.author} tried to ruin the count, but the number was already **0**!\nNo stats (saves, incorrect numbers) have been modified.`)
							//this is the way to bypass the increment of wrong numbers. It removes and then adds one, cancelling it out.
							lecountr.decrement('wrongNumbers');
						} else if (lecountr.saves >= 10) {
							if (useCustomEmoji) {message.react(customEmojiList.warn)} else {message.react('⚠️')}
							const ten = 10
							lecountr.decrement('saves', { by: ten})
							message.reply(`${message.author} almost ruined the count, but one of their saves were used!\n${message.author.tag} now has **${(lecountr.saves-10)/10}** saves remaining.\nThe next number is **${numb + 1}** | **Wrong Number.**\n**STREAK LOST AT ${streak}!**`)
							if (logSaveUses) console.log(`${message.author.tag} used one of their saves, now they have ${(lecountr.saves-1)/10}`)
						} else if (serverSaves >= 1) {
							if (useCustomEmoji) {message.react(customEmojiList.warn)} else {message.react('⚠️')}
							serverSaves--
							message.reply(`${message.author} almost ruined the count, but a server save was used!\n**${serverSaves}** server saves remain.\nThe next number is **${numb+1}** | **Wrong Number.**\n**STREAK LOST AT ${streak}!**`)
							if (logSaveUses) console.log(`${message.author.tag} used a server save, now the server has ${serverSaves}}!`)
						} else {
							if (useCustomEmoji) {message.react(customEmojiList.ruin)} else {message.react('❌')}
							message.reply(`${message.author} ruined the count!\nThe next number was **${numb+1}**, but they said **${thec}**!\nThe next number is **1** | **Wrong Number.**\n**STREAK LOST AT ${streak}!**`)
							numb = 0
							lastCounterId = "0"
							guildDB.update({ lastCounterID: "0" })
							if (logRuins) console.log(`${message.author.tag} ruined the count at ${numb}!`)
						}
						lecountr.increment('wrongNumbers');
						streak = 0
					}
				} else {
					canAllCount = false;
						setTimeout(() => {
							canAllCount = true;
						}, 3000);
					if (lecountr.saves >= 10) {
						if (useCustomEmoji) {message.react(customEmojiList.warn)} else {message.react('⚠️')}
						lecountr.decrement('saves', {by: 10})
						message.reply(`${message.author} almost ruined the count, but one of their saves were used!\n${message.author.tag} now has **${(lecountr.saves-10)/10}** saves remaining.\nThe next number is **${numb + 1}** | **You cannot count twice in a row!**\n**STREAK LOST AT ${streak}!**`)
						if (logSaveUses) console.log(`${message.author.tag} used one of their saves, now they have ${(lecountr.saves-10)/10}`)
					} else if (numb == 0){
						if (useCustomEmoji) {message.react(customEmojiList.warn)} else {message.react('⚠️')}
						message.reply(`${message.author} tried to ruin the count, but the number was already **0**!\nNo stats (saves, incorrect numbers) have been modified.`)
						//this is the way to bypass the increment of wrong numbers. It removes and then adds one, cancelling it out.
						lecountr.decrement('wrongNumbers');
					} else if (serverSaves >= 1) {
						if (useCustomEmoji) {message.react(customEmojiList.warn)} else {message.react('⚠️')}
						serverSaves--
						message.reply(`${message.author} almost ruined the count, but a server save was used!\n**${serverSaves}** server saves remain.\nThe next number is **${numb+1}** | **You cannot count more than one time in a row**!\n**STREAK LOST AT ${streak}!**`)
						if (logSaveUses) console.log(`${message.author.tag} used a server save, now the server has ${serverSaves}}!`)
					} else {
						if (useCustomEmoji) {message.react(customEmojiList.ruin)} else {message.react('❌')}
						message.reply(`${message.author} ruined the count!\nThe next number was **${numb+1}**, but they said **${thec}**! | **You cannot count more than one time in a row**!\n**STREAK LOST AT ${streak}!**`)
						numb = 0
						lastCounterId = "0"
						guildDB.update({ lastCounterID: "0" })
						if (logRuins) console.log(`${message.author.tag} ruined the count at ${numb}!`)
					}
					lecountr.increment('wrongNumbers');
					streak = 0
			}
			guildDB.update({ count: numb, guildSaves: serverSaves, highscore: highscore, streak: streak })
		}
	}
	}

});

client.on('messageDelete', async message => {
	if (message.author.bot) return

	//if (message.type !== "DEFAULT") return;
	switch (message.type){
		case "DEFAULT": break;
		case "REPLY": break;
		default: return;
	}

	if (message.channel.id === countingCh) {
		let [lecountr, ] = await client.db.Counters.findOrCreate({ where: { userID: message.author.id } });

		if (lecountr.banned) return;

		if (validateExpression(message.content.split(" ")[0]) && message.attachments.size == 0 && message.stickers.size == 0 && message.content.toUpperCase() !== "INFINITY") {
			let thec = parseInt(message.content.split(' ')[0])
			if (thec == String(numb)){
				message.channel.send(`${message.author} deleted their number! The current number is **${numb}**.`)
			}
		}
	}
});

//check every second asynchronously
setInterval(async () => {
	const n = Math.floor(Date.now() / 1000)
	//get list of all counters
	let counters = await client.db.Counters.findAll({ attributes: ['userID', 'saveCooldown', 'config', 'hasUserBeenDMed'] })

	//loop through all counters
	for (let i = 0; i < counters.length; i++) {
		const lastBeg = parseInt(counters[i].get('saveCooldown'))
		const dmEnabled = (JSON.parse(counters[i].get("config")).enableClaimDM)
		const hasUserBeenDMed = counters[i].get('hasUserBeenDMed')
		if(n < lastBeg+saveClaimCooldown || !dmEnabled || hasUserBeenDMed ){
			continue
		} else {
			let user = await client.users.fetch(counters[i].get('userID'))
			let guild = await client.guilds.cache.get(guildId)
			let savesClaimCommandID = await guild.commands.fetch()
			savesClaimCommandID = savesClaimCommandID.find(c => c.name == "saves").id
			//check if we can dm the user
			user.send(`Your save is ready! Use </saves claim:${savesClaimCommandID}> to claim it!`)
				.catch(err => {
					if(fallbackToChannelIfDMFails) {
						console.warn(`Unable to DM user with ID ${counters[i].get('userID')}, notifying them in counting channel!`)
						//send notification to counting channel
						client.channels.cache.get(countingCh).send(`${user}, Your save is ready! Use </saves claim:${savesClaimCommandID}> to claim it!`)
					}
				})
			const counter = await client.db.Counters.findOne({ where: { userID: counters[i].get("userID") } })
			counter.update({ hasUserBeenDMed: true })
		}
	}
	
}, 1000);

//fallbacks just incase something really bad happens
process.on('uncaughtException', (error, origin) => {
	console.log(`❌ Uncaught exception\n-----\n${error.stack}\n-----\nException origin\n${origin}`)
})

process.on('unhandledRejection', (reason, promise) => {
	console.log(`❌ Unhandled Rejection\n-----\n${promise}\n-----\nReason\n${reason}`)
})

client.login(token);