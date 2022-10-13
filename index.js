const fs = require('node:fs');
const Sequelize = require('sequelize');
const { Client, Collection, Intents, WebhookClient } = require('discord.js');
const { token, countingCh, useCustomEmoji, SQL_USER, SQL_PASS, numbersRequiredForFreeSave, freeSave, saveClaimCooldown, logHook, redirectConsoleOutputToWebhook, customEmojiList } = require('./config.json');
const mathx = require('math-expression-evaluator');
const client = new Client({ ws: { properties: { browser: "Discord iOS" }}, intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });

//database shit
const sequelize = new Sequelize('database', SQL_USER, SQL_PASS, {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
});
client.db = require('./modal/database.js')

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

//redef some console functions here
console.log = function(e) {
	try {
		if (redirectConsoleOutputToWebhook) {
			let webhookClient = new WebhookClient({ url: logHook });
			webhookClient.send(`\`\`\`\n${e}\n\`\`\``);
		}
	} catch(e) {
		process.stdout.write(`Unable to redirect output: ${e}\n`);
	}
	process.stdout.write(`${e}\n`);
}

console.warn = function(e) {
	try {
		if (redirectConsoleOutputToWebhook) {
			let webhookClient = new WebhookClient({ url: logHook });
			webhookClient.send(`\`\`\`\n[WARN] ${e}\n\`\`\``);
		}
	} catch(e) {
		process.stdout.write(`Unable to redirect output: ${e}\n`);
	}
	process.stdout.write(`[WARN] ${e}\n`);
}

console.error = function(e) {
	try {
		if (redirectConsoleOutputToWebhook) {
			let webhookClient = new WebhookClient({ url: logHook });
			webhookClient.send(`\`\`\`\n[ERROR] ${e}\n\`\`\``);
		}
	} catch(e) {
		process.stdout.write(`Unable to redirect output: ${e}\n`);
	}
	process.stdout.write(`[ERROR] ${e}\n`);
}

const recentCountRuiners= new Set();

var canAllCount = true
var lastCounterId
var serverSaves
var guildDB 
var highscore
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}
function validateExpression(number) {
	return /^[+\-/*^0-9().]+$/.test(number)
}

client.once('ready', async () => {
	//sync database tables
	await client.db.Counters.sync()
	await client.db.Data.sync()

	let guild = await client.channels.fetch(countingCh); guild = guild.guild
	let [localDB, ]= await client.db.Data.findOrCreate({ where: { guildID: guild.id }}) 
	numb = localDB.count
	highscore = localDB.highscore
	serverSaves = localDB.guildSaves
	lastCounterId = localDB.lastCounterID
	console.log(`✅ Signed in as ${client.user.tag}! \n`);
	if (useCustomEmoji) {console.log("Custom Emoji support is on! Some emojis may fail to react if the bot is not in the server with the emoji.")} else {console.log("Custom Emoji support is off! No custom emojis will be used.")}
	client.user.setActivity(`counting | ${numb}`, { type: 'COMPETING' });
	guildDB = localDB
});

client.once('ready', async () => {
	setInterval(() => {
		client.user.setActivity(`counting | ${numb}`, { type: 'COMPETING' });
	}, 90000);
});

//All slash commands. check "commands" folder
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);

		let guildDB = await client.db.Data.findOne({ where: { guildID: interaction.guild.id} }) //i can run this instead of findOrCreate because it already exists by now lol
		numb = guildDB.count
		highscore = guildDB.highscore
		serverSaves = guildDB.guildSaves
	} catch (error) {
		console.log(`${error}\n\n`)
		if (interaction.user.id !== "284804878604435476") {
            await interaction.reply({content: `if you are seeing this, <@284804878604435476> or <@808720142137294949> messed up somehow. send this error to them plz :)\n\n\`\`\`${error}\`\`\``, ephemeral: true})
        } else {
            await interaction.reply({content: `wow good job you fucked something up (again)\n\n\`\`\`${error}\`\`\``, ephemeral: true})
        }
	}
});

client.on('messageCreate', async message => {

	let isNewCounter=0

	if (message.author.bot) return

	if (!canAllCount) return

	//if (message.type !== "DEFAULT") return;
	switch (message.type){
		case "DEFAULT": break;
		case "REPLY": break;
		default: return;
	}

	if (message.channel.id === countingCh) {
		//console.log(message.type)
		
		if (Date.now() - message.author.createdAt < 1000*60*60*24*7) {
			if (validateExpression(message.content.split(" ")[0]) && message.attachments.size == 0 && message.stickers.size == 0 && message.content.toUpperCase() !== "INFINITY") { 
				if (useCustomEmoji) {message.react(customEmojiList.ignored)} else {message.react("⛔")}
				message.reply("⚠️ **Your account is too young to count! Your account must be 7 days old to count.**")
				return;
			}
		  }

		let [lecountr, isNewCounter] = await client.db.Counters.findOrCreate({ where: { userID: message.author.id } });

		if (isNewCounter) {
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
						if (highscore < numb) highscore = numb;
						lastCounterId = message.author.id
						guildDB.update({ lastCounterID: message.author.id })
						lecountr.increment('numbers');
						
						if(lecountr.numbers % numbersRequiredForFreeSave == 0) { //every 50(by default) numbers
							//lecountr.increment('saves', { by: freeSave.toFixed(1) })
							if (lecountr.saves >= lecountr.slots) return;
							lecountr.update({
								saves: (lecountr.saves + freeSave).toFixed(1)
							})
						}
					} else {
						canAllCount = false;
							setTimeout(() => {
								canAllCount = true;
							}, 3000);
						if (message.content.length >= 1500){
							//sure we can just ignore it but it's funnier when the bot replies lol
							if (useCustomEmoji) {message.react(customEmojiList.ignored)} else {message.react("⛔")}
							message.reply("https://cdn.discordapp.com/attachments/875920385315577867/927848021968949268/Screenshot_20220103-225144.jpg?size=4096")
						} else if (lecountr.saves >= 10) {
							if (useCustomEmoji) {message.react(customEmojiList.warn)} else {message.react('⚠️')}
							const ten = 10
							lecountr.decrement('saves', { by: ten})
							message.reply(`${message.author} almost ruined the count, but one of their saves were used!\n${message.author.tag} now has **${(lecountr.saves-10)/10}** saves remaining.\nThe next number is **${numb + 1}** | **Wrong Number.**`)
						} else if (serverSaves >= 1) {
							if (useCustomEmoji) {message.react(customEmojiList.warn)} else {message.react('⚠️')}
							serverSaves--
							message.reply(`${message.author} almost ruined the count, but a server save was used!\n**${serverSaves}** server saves remain.\nThe next number is **${numb+1}** | **Wrong Number.**`)
						} else {
							if (useCustomEmoji) {message.react(customEmojiList.ruin)} else {message.react('❌')}
							message.reply(`${message.author} ruined the count!\nThe next number was **${numb+1}**, but they said **${thec}**!\nThe next number is **1** | **Wrong Number.**`)
							numb = 0
							lastCounterId = "0"
						}
						lecountr.increment('wrongNumbers');
					}
				} else {
					canAllCount = false;
						setTimeout(() => {
							canAllCount = true;
						}, 3000);
					if (lecountr.saves >= 10) {
						if (useCustomEmoji) {message.react(customEmojiList.warn)} else {message.react('⚠️')}
						lecountr.decrement('saves', {by: 10})
						message.reply(`${message.author} almost ruined the count, but one of their saves were used!\n${message.author.tag} now has **${(lecountr.saves-10)/10}** saves remaining.\nThe next number is **${numb + 1}** | **You cannot count twice in a row!**`)
					} else if (serverSaves >= 1) {
						if (useCustomEmoji) {message.react(customEmojiList.warn)} else {message.react('⚠️')}
						serverSaves--
						message.reply(`${message.author} almost ruined the count, but a server save was used!\n**${serverSaves}** server saves remain.\nThe next number is **${numb+1}** | **You cannot count more than one time in a row**!`)
					} else {
						if (useCustomEmoji) {message.react(customEmojiList.ruin)} else {message.react('❌')}
						message.reply(`${message.author} ruined the count!\nThe next number was **${numb+1}**, but they said **${thec}**! | **You cannot count more than one time in a row**!`)
						numb = 0
						lastCounterId = "0"
					}
					lecountr.increment('wrongNumbers');
			}
			guildDB.update({ count: numb, guildSaves: serverSaves, highscore: highscore })

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

//check every second asyncronously
setInterval(async () => {
	const n = Math.floor(Date.now() / 1000)
	//get list of all counters
	let counters = await client.db.Counters.findAll({ attributes: ['userID', 'saveCooldown'] })

	//loop through all counters
	for (let i = 0; i < counters.length; i++) {
		const lastBeg= parseInt(counters[i].get('saveCooldown'))
		if(n !== lastBeg+saveClaimCooldown){
			continue
		} else {
			let user = await client.users.fetch(counters[i].get('userID'))
			//check if we can dm the user
			user.send(`Your save is ready! Use </saves claim:990342833003184204> to claim it!`)
				.catch(err => {
					console.warn(`Unable to DM user with ID ${counters[i].get('userID')}, notifying them in counting channel!`)
					//send notification to counting channel
					client.channels.cache.get(countingCh).send(`${user}, Your save is ready! Use </saves claim:990342833003184204> to claim it!`)
				})
		}
	}
	
}, 1000);

process.on('uncaughtException', (error, origin) => {
    //console.log('----- Uncaught exception -----')
    //console.log(error)
    //console.log('----- Exception origin -----')
    //console.log(origin)
	console.log(`❌ Uncaught exception\n-----\n${error}\n-----\nException origin\n${origin}`)
	//let webhookClient = new WebhookClient({ url: logWebhookURL });
	//webhookClient.send(`<@284804878604435476> [ERR]\n\`\`\`${error}\`\`\`\n\n\`\`\`${origin}\`\`\``);
})

process.on('unhandledRejection', (reason, promise) => {
    //console.log('----- Unhandled Rejection at -----')
    //console.log(promise)
    //console.log('----- Reason -----')
    //console.log(reason)
	console.log(`❌ Unhandled Rejection\n-----\n${promise}\n-----\nReason\n${reason}`)
	//let webhookClient = new WebhookClient({ url: logWebhookURL });
	//webhookClient.send(`<@284804878604435476> [REJ]\n\`\`\`${promise}\`\`\`\n\n\`\`\`${reason}\`\`\``);
})

/*
process.on('uncaughtException', (error, origin) => {
	let webhookClient = new WebhookClient({ url: logHook });
	webhookClient.send(`Uncaught exception\n\`\`\`${error}\`\`\`\nException origin\n\`\`\`${origin}\`\`\``);
    console.log('----- Uncaught exception -----')
    console.log(error)
    console.log('----- Exception origin -----')
    console.log(origin)
})

process.on('unhandledRejection', (reason, promise) => {
	let webhookClient = new WebhookClient({ url: logHook });
	webhookClient.send(`Unhandled Rejection at\n\`\`\`${promise}\`\`\`\nReason\n\`\`\`${reason}\`\`\``);
    console.log('----- Unhandled Rejection at -----')
    console.log(promise)
    console.log('----- Reason -----')
    console.log(reason)
})
*/

client.login(token);