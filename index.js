const fs = require('node:fs');
const { Client, Collection, Intents, WebhookClient } = require('discord.js');
const { token, countingCh, useCustomEmoji, numbersRequiredForFreeSave, freeSave, saveClaimCooldown, logHook, redirectConsoleOutputToWebhook, customEmojiList, longMessageEasterEggContent, longMessageEasterEgg, ruinDelay, nerdstatExecutor, guildId, logRuins, logSaveUses, enableRulesFile, showRulesOnFirstCount, status, fallbackToChannelIfDMFails, ageGate } = require('./config.json');
const mathx = require('math-expression-evaluator');
const client = new Client({ ws: { properties: { browser: "Discord iOS" }}, intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });
const { isNumber, formattedName } = require('./Util.js')

client.db = require('./database.js')

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

//redef some console functions here
console.log = async function(e) {
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

console.warn = async function(e) {
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

console.error = async function(e) {
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
	console.log(`⚠️ ProgressCount95 is now deprecated, and use of it is no longer encouraged. View the README file for more information.`)
	console.log(`✅ Signed in as ${client.user.tag}! \n`);
	if (useCustomEmoji) {console.log("Custom Emoji support is on! Some emojis may fail to react if the bot is not in the server with the emoji.")} else {console.log("Custom Emoji support is off! No custom emojis will be used.")}
	guildDB = localDB

	client.user.setStatus(status.onlineStatus);
	if (status.enableActivity) {
		client.user.setActivity(`${status.activity_name} ${(status.showCurrentNumber ? `| ${numb}` : '')}`, { type: status.activity_type });

		if (status.showCurrentNumber) {
			setInterval(() => {
				client.user.setActivity(`${status.activity_name} ${(status.showCurrentNumber ? `| ${numb}` : '')}`, { type: status.activity_type });
			}, 90000);
		}
	}
});

//All slash commands. check "commands" folder
client.on('interactionCreate', async interaction => {
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

	//ONLY execute if it's in the desired counting channel
	if (message.channel.id === countingCh && isNumber(message)) {

		//Age Gate
		if (ageGate.enable) {
			let accountAge = Date.now() - message.author.createdAt.getTime();
			let ageInDays = accountAge / (1000 * 60 * 60 * 24); // convert milliseconds to days

			if (ageInDays <= ageGate.age) {
				if (useCustomEmoji) {message.react(customEmojiList.ignored)} else {message.react("⛔")}
				return message.reply("⚠️ **Your account is too young to count! Your account must be 7 days old to count.**")
			}
		}

		//define the user that sent the number
		let [user_counter, isNewCounter] = await client.db.Counters.findOrCreate({ where: { userID: message.author.id } });

		//send rules if they are a new counter AND if rules are enabled
		if (isNewCounter && enableRulesFile && showRulesOnFirstCount) {message.reply(fs.readFileSync('./rules.txt',{encoding:'utf8', flag:'r'}));}

		//if they are banned react with the ignored emoji and end execution.
		if (user_counter.banned) {
			if (useCustomEmoji) {message.react(customEmojiList.ignored)} else {message.react("⛔")}
			return;
		}

		//actual counting logic
		try {
			var user_count = mathx.eval(message.content.split(' ')[0])
		} catch(e) {return} //just incase it fails

		if (!isNaN(user_count)) {
			//fails
			if (lastCounterId == message.author.id) {return fail("2_IN_A_ROW", user_counter, message, user_count);} //2 times in a row
			if (user_count != String(numb+1)) {return fail("NUMBER_WRONG", user_counter, message, user_count);} //wrong number

			//add message reaction
			if (useCustomEmoji) {
				if (user_count in customEmojiList.other) {
					message.react(customEmojiList.other[user_count])
				} else {
					let hasReacted=0
					for (const [key,value] of Object.entries(customEmojiList.milestones).reverse()) {
						let remainder = user_count % +key
						if (remainder === 0) {
							message.react(value)
							hasReacted = 1 
							break;
						}
					}
					for (const [key,value] of Object.entries(customEmojiList.endings)) {
						if (user_count.toString().endsWith(key)) {
							message.react(value)
							hasReacted = 1 
							break;
						}
					}
					if (!hasReacted) {
						if (user_count.toString().length > 2 && user_count.toString() == user_count.toString().split('').reverse().join('')) {
							message.react(customEmojiList.palindrome)
						} else if (highscore < user_count) {
							message.react(customEmojiList.highscore)
						} else {
							message.react(customEmojiList.normal)
						}
					}
				}
			 } else {
				switch (user_count){
					case 100: message.react("💯"); break;
					case 420: message.react("🌿"); break;
					default: if (highscore < user_count) message.react("☑"); else message.react("✅"); break;
				}
			}

			//increase local variables
			numb++
			streak++
			if (highscore < numb) highscore = numb;
			lastCounterId = message.author.id
			guildDB.update({ lastCounterID: message.author.id })
			user_counter.increment('numbers');

			//free save
			if(user_counter.numbers % numbersRequiredForFreeSave == 0) { //every 50(by default) numbers
				//lecountr.increment('saves', { by: freeSave.toFixed(1) })
				if (user_counter.saves >= user_counter.slots*10) return;
				let freeSaveClamped
				if ((user_counter.saves + freeSave) > user_counter.slots*10) {
					freeSaveClamped = user_counter.slots*10 - user_counter.saves 
					console.log(`clamped: ${freeSaveClamped}`)
				} else freeSaveClamped = freeSave
				user_counter.update({saves: (user_counter.saves + freeSaveClamped)})
				user_counter = await client.db.Counters.findOne({ where: { userID: message.author.id } });
			}

			guildDB.update({ count: numb, guildSaves: serverSaves, highscore: highscore, streak: streak })
		}
	}

});

//delete detection
client.on('messageDelete', async message => {
	if (message.author.bot) return

	//if (message.type !== "DEFAULT") return;
	switch (message.type){
		case "DEFAULT": break;
		case "REPLY": break;
		default: return;
	}

	if (message.channel.id === countingCh && isNumber(message)) {
		let [user_counter, ] = await client.db.Counters.findOrCreate({ where: { userID: message.author.id } });

		if (user_counter.banned) return;

		let user_count = parseInt(message.content.split(' ')[0])
		if (user_count == String(numb)){
			message.channel.send(`${message.author} deleted their number! The current number is **${numb}**.`)
		}
	}
});

//fail function
async function fail(reason_for_fail, user_counter, message, user_count) {
	let formal_fail_reason = ""

	switch (reason_for_fail) {
		case "2_IN_A_ROW": formal_fail_reason = "You cannot count twice in a row!"; break;
		case "NUMBER_WRONG": formal_fail_reason = "Wrong number!"; break;
		default: formal_fail_reason = `UNDEFINED FAIL REASON \`${reason_for_fail}\`!`; break;
	}

	//disable counting for a set delay
	canAllCount = false;
	setTimeout(() => {
		canAllCount = true;
	}, ruinDelay);

	if (numb == 0) { //don't add or remove stats if the number was already 0, but still notify them

		if (useCustomEmoji) {message.react(customEmojiList.warn)} else {message.react('⚠️')}
		message.reply(`${message.author} tried to ruin the count, but the number was already **0**!\nNo stats (saves, incorrect numbers) have been modified.\n**${formal_fail_reason}**`)
		//this is the way to bypass the increment of wrong numbers. It removes and then adds one, cancelling it out.
		user_counter.decrement('wrongNumbers');

	} else if (user_counter.saves >= 10) { //if the user has saves

		if (useCustomEmoji) {message.react(customEmojiList.warn)} else {message.react('⚠️')}
		user_counter.decrement('saves', {by: 10})
		message.reply(`${message.author} almost ruined the count, but one of their saves were used!\n${formattedName(message.author)} now has **${(user_counter.saves-10)/10}** saves remaining.\nThe next number is **${numb + 1}** | **${formal_fail_reason}**\n**STREAK LOST AT ${streak}!**`)
		if (logSaveUses) console.log(`${formattedName(message.author)} used one of their saves, now they have ${(user_counter.saves-10)/10}`)

	} else if (serverSaves >= 1) { //if there are server saves

		if (useCustomEmoji) {message.react(customEmojiList.warn)} else {message.react('⚠️')}
		serverSaves--
		message.reply(`${message.author} almost ruined the count, but a server save was used!\n**${serverSaves}** server saves remain.\nThe next number is **${numb+1}** | **${formal_fail_reason}**!\n**STREAK LOST AT ${streak}!**`)
		if (logSaveUses) console.log(`${formattedName(message.author)} used a server save, now the server has ${serverSaves}}!`)

	} else { //No saves (user and server) and the number was not 0 to start with

		if (useCustomEmoji) {message.react(customEmojiList.ruin)} else {message.react('❌')}
		message.reply(`${message.author} ruined the count!\nThe next number was **${numb+1}**, but they said **${user_count}**! | **${formal_fail_reason}**!\n**STREAK LOST AT ${streak}!**`)
		numb = 0
		lastCounterId = "0"
		guildDB.update({ lastCounterID: "0" })
		if (logRuins) console.log(`${formattedName(message.author)} ruined the count at ${numb}!`)

	}

	//modify user stats and streak
	user_counter.increment('wrongNumbers');
	streak = 0

	guildDB.update({ count: numb, guildSaves: serverSaves, highscore: highscore, streak: streak })
}

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
process.on('uncaughtException', async (error, origin) => {
	console.log(`❌ Uncaught exception\n-----\n${error.stack}\n-----\nException origin\n${origin}`)
})

process.on('unhandledRejection',  async (reason, promise) => {
	console.log(`❌ Unhandled Rejection\n-----\n${promise}\n-----\nReason\n${reason}`)
})

client.login(token);