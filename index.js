const fs = require('node:fs');
const Sequelize = require('sequelize');
const { Client, Collection, Intents } = require('discord.js');
const { token, countingCh, useCustomEmoji, SQL_USER, SQL_PASS, numbersRequiredForFreeSave, freeSave, saveClaimCooldown } = require('./config.json');
const mathx = require('math-expression-evaluator')
const client = new Client({ ws: { properties: { $browser: "Discord iOS" }}, intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });

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
	console.log('Ready!\n');
	if (useCustomEmoji) {console.log("Custom Emoji support is on! Some emojis may fail to react if the bot is not in the server with the emoji.")} else {console.log("Custom Emoji support is off! No custom emojis will be used.")}
	client.user.setActivity('counting', { type: 'COMPETING' });
	guildDB = localDB
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
				if (useCustomEmoji) {message.react("<:NumberIgnored:981961793947705415>")} else {message.react("⛔")}
				message.reply("⚠️ **Your account is too young to count! Your account must be 7 days old to count.**")
				return;
			}
		  }

		let [lecountr, ] = await client.db.Counters.findOrCreate({ where: { userID: message.author.id } });

		if (lecountr.banned) {
			if (validateExpression(message.content.split(" ")[0]) && message.attachments.size == 0 && message.stickers.size == 0 && message.content.toUpperCase() !== "INFINITY") { 
				if (useCustomEmoji) {message.react("<:NumberIgnored:981961793947705415>")} else {message.react("⛔")}
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
							switch (thec){
								case 2: message.react("<:PB2:819146879727566873>"); break; //PB2
								case 11: message.react("<:PB11:868370023104798720>"); break; //PB11
								case 81: message.react("<:PB81:819147983667986432> "); break; //PB81
								case 7: message.react("<:PB7:704867972182704178>"); break; //PB7
								case 32: message.react("<:sys32:817120108761186405>"); break; //Sys32
								case 67: message.react("<:pBarFlint67:892434159300120629>"); break; //pbar67
								case 66: message.react("<:pBar66:868370162187927632>"); break; //pbar66
								case 65: message.react("<:pBar65:856835166374199297>"); break; //pbar65
								case 64: message.react("<:pBar64:853138163827212308>"); break; //pbar64
								case 63: message.react("<:pBar63:840276684556337172>"); break; //pbar63
								case 2000: message.react("<:PB2000:819147424466993212>"); break; //pb2000
								case 9000: message.react("<:ProgreshPower9000:825373078368288798>"); break; //power9000
								case 800: message.react("<:ProgreshBC800:819147801425477652>"); break; //BC800
								case 64: message.react("<:Progresh64KB:819147680089374730>"); break; //64KB
								case 36: message.react("<:PBNOT36:819147051912134657>"); break; //NOT36
								case 98: message.react("<:PB98:819146172928491580>"); break; //98
								case 95: message.react("<:PB95:662601719653597196>"); break; //95
								//NOT BAR GAME RELATED BUT STILL FUNNY
								case 100: message.react("💯"); break;
								case 420: message.react("<a:420:986336382530256897>"); break;
								case 1984: message.react("<a:1984:971405081817804800>"); break;
								default: if (highscore < thec) message.react("<:CheckBlue:983780095628042260>"); else message.react("<:CheckMark:981961793800921140>"); break;
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
					} else {
						canAllCount = false;
							setTimeout(() => {
								canAllCount = true;
							}, 3000);
						if (message.content.length >= 1500){
							//sure we can just ignore it but it's funnier when the bot replies lol
							message.reply("https://cdn.discordapp.com/attachments/875920385315577867/927848021968949268/Screenshot_20220103-225144.jpg?size=4096")
						} else if (lecountr.saves >= 1) {
							if (useCustomEmoji) {message.react('<:CountingWarn:981961793515716630>')} else {message.react('⚠️')}
							lecountr.decrement('saves')
							message.reply(`${message.author} almost ruined the count, but they used one of their user saves!\n${message.author.tag} has **${lecountr.saves -1}** saves remaining.\nThe next number is **${numb + 1}** | **Wrong Number.**`)
						} else if (serverSaves >= 1) {
							if (useCustomEmoji) {message.react('<:CountingWarn:981961793515716630>')} else {message.react('⚠️')}
							serverSaves--
							message.reply(`${message.author} almost ruined the count, but a server save was used!\n**${serverSaves}** server saves remain.\nThe next number is **${numb+1}** | **Wrong Number.**`)
						} else {
							if (useCustomEmoji) {message.react('<:XMark:981961793817694259>')} else {message.react('❌')}
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
					if (lecountr.saves >= 1) {
						if (useCustomEmoji) {message.react('<:CountingWarn:981961793515716630>')} else {message.react('⚠️')}
						lecountr.decrement('saves')
						message.reply(`${message.author} almost ruined the count, but they used one of their user saves!\n${message.author.tag} has **${lecountr.saves -1}** saves remaining.\nThe next number is **${numb + 1}** | **You cannot count twice in a row!**`)
					} else if (serverSaves >= 1) {
						if (useCustomEmoji) {message.react('<:CountingWarn:981961793515716630>')} else {message.react('⚠️')}
						serverSaves--
						message.reply(`${message.author} almost ruined the count, but a server save was used!\n**${serverSaves}** server saves remain.\nThe next number is **${numb+1}** | **You cannot count more than one time in a row**!`)
					} else {
						if (useCustomEmoji) {message.react('<:XMark:981961793817694259>')} else {message.react('❌')}
						message.reply(`${message.author} ruined the count!\nThe next number is **1** | **You cannot count more than one time in a row**!`)
						numb = 0
						lastCounterId = "0"
					}
					lecountr.increment('wrongNumbers');
			}
			guildDB.update({ count: numb, guildSaves: serverSaves, highscore: highscore })

			if(lecountr.numbers % numbersRequiredForFreeSave == 0) { //every 50(by default) numbers
				//lecountr.increment('saves', { by: freeSave.toFixed(1) })
				lecountr.update({
					saves: (lecountr.saves + freeSave).toFixed(1)
				})
			}
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
			user.send(`Your save is ready! Use \`/save claim\` to claim it!`)
				.catch(err => {
					console.log(`[WARN] Unable to DM user with ID ${counters[i].get('userID')}`)
					//send notification to counting channel
					client.channels.cache.get(countingCh).send(`${user} your save is ready! Use \`/save claim\` to claim it!`)
				})
		}
	}
	
}, 1000);

process.on('uncaughtException', (error, origin) => {
    console.log('----- Uncaught exception -----')
    console.log(error)
    console.log('----- Exception origin -----')
    console.log(origin)
})

process.on('unhandledRejection', (reason, promise) => {
    console.log('----- Unhandled Rejection at -----')
    console.log(promise)
    console.log('----- Reason -----')
    console.log(reason)
})

client.login(token);