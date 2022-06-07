const fs = require('node:fs');
const Sequelize = require('sequelize');
const { Client, Collection, Intents } = require('discord.js');
const { token, countingCh, useCustomEmoji, SQL_USER, SQL_PASS } = require('./config.json');

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

//var numb = parseInt(fs.readFileSync('./data/numb.txt', 'utf8'))
var lastCounterId
var serverSaves

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

client.once('ready', async () => {
	//sync database tables
	await client.db.Counters.sync()
	await client.db.Data.sync()

	let guild = await client.channels.fetch(countingCh); guild = guild.guild
	var [guildDB,] = await client.db.Data.findOrCreate({ where: { guildID: guild.id }, defaults: { count: 0, highscore: 0, lastCounterID: "0", guildSaves: 3 } }) 
	numb = guildDB.count
	serverSaves = guildDB.saves
	lastCounterId = guildDB.lastCounterID
	console.log('Ready!\n');
	if (useCustomEmoji) {console.log("Custom Emoji support is on! Some emojis may fail to react if the bot is not in the server with the emoji.")} else {console.log("Custom Emoji support is off! No custom emojis will be used.")}
	client.user.setActivity('counting', { type: 'COMPETING' });
});

//All slash commands. check "commands" folder
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	//try {
		await command.execute(interaction);
		
		numb = guildDB.count
	/*} catch (error) {
		console.log(`${error}\n\n`)
		if (interaction.user.id !== "284804878604435476") {
            await interaction.reply({content: `if you are seeing this, <@284804878604435476> messed up somehow. send this error to him plz :)\n\n\`\`\`${btoa(error)}\`\`\``, ephemeral: true})
        } else {
            await interaction.reply({content: `wow good job you fucked something up (again)\n\n\`\`\`${error}\`\`\``, ephemeral: true})
        }
	}*/
});

client.on('messageCreate', async message => {

	if (message.author.bot) return

	if (message.type !== "DEFAULT") return;

	if (message.channel.id === countingCh) {
		//console.log(message.type)

		let [lecountr, ] = await client.db.Counters.findOrCreate({ where: { userID: message.author.id }, defaults: { numbers: 0, wrongNumbers: 0, saves: 2, slots: 5 } });

		if (lecountr.banned) {
			if (!isNaN(message.content.split(' ')[0]) && message.attachments.size == 0 && message.stickers.size == 0) { 
				message.react("<:NumberIgnored:981961793947705415>"); 
			}
			return;
		}

		//check if first string in message is a number
		if (!isNaN(message.content.split(' ')[0]) && message.attachments.size == 0 && message.stickers.size == 0) {
			if (lastCounterId !== message.author.id) {
				var thec = message.content.split(' ')[0]
				if (thec == String(numb+1)) {
					if (useCustomEmoji) {
						switch (thec){
							case "32": message.react("<:sys32:817120108761186405>"); break; //Sys32
							case "67": message.react("<:pBarFlint67:892434159300120629>"); break; //pbar67
							case "66": message.react("<:pBar66:868370162187927632>"); break; //pbar66
							case "65": message.react("<:pBar65:856835166374199297>"); break; //pbar65
							case "64": message.react("<:pBar64:853138163827212308>"); break; //pbar64
							case "63": message.react("<:pBar63:840276684556337172>"); break; //pbar63
							case "9000": message.react("<:ProgreshPower9000:825373078368288798>"); break; //power9000
							case "800": message.react("<:ProgreshBC800:819147801425477652>"); break; //BC800
							case "64": message.react("<:Progresh64KB:819147680089374730>"); break; //64KB
							case "36": message.react("<:PBNOT36:819147051912134657>"); break; //NOT36
							case "98": message.react("<:PB98:819146172928491580>"); break; //98
							case "95": message.react("<:PB95:662601719653597196>"); break; //95
							//NOT BAR GAME RELATED BUT STILL FUNNY
							case "100": message.react("💯"); break;
							case "1984": message.react("<a:1984:971405081817804800>"); break;
							default: message.react("<:CheckMark:981961793800921140>"); break;
						}
					} else {
						message.react("✅");
					}
					numb++
					lastCounterId = message.author.id

					lecountr.increment('numbers');
				} else {
					if (message.content.length >= 1500){
						message.reply("https://cdn.discordapp.com/attachments/875920385315577867/927848021968949268/Screenshot_20220103-225144.jpg?size=4096")
					} else if (lecountr.saves >= 1) {
						if (useCustomEmoji) {message.react('<:CountingWarn:981961793515716630>')} else {message.react('⚠️')}
						lecountr.decrement('saves')
						message.reply(`${message.author}, wrong number! You have used 1 of your saves and have ${lecountr.saves -1} saves remaining.\nThe next number is ${numb + 1}`)
					} else if (serverSaves >= 1) {
						if (useCustomEmoji) {message.react('<:CountingWarn:981961793515716630>')} else {message.react('⚠️')}
						--serverSaves
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
			    if (lecountr.saves >= 1) {
					if (useCustomEmoji) {message.react('<:CountingWarn:981961793515716630>')} else {message.react('⚠️')}
					lecountr.decrement('saves')
					message.reply(`${message.author}, you can't count twice in a row! You have used 1 of your saves and have ${lecountr.saves -1} saves remaining.\nThe next number is ${numb + 1}`)
				} else if (serverSaves !== 0) {
					if (useCustomEmoji) {message.react('<:CountingWarn:981961793515716630>')} else {message.react('⚠️')}
					--serverSaves
					message.reply(`${message.author} almost ruined the count, but a server save was used!\n**${serverSaves}** server saves remain.\nThe next number is **${numb+1}** | **You cannot count more than one time in a row**!`)
				} else {
					if (useCustomEmoji) {message.react('<:XMark:981961793817694259>')} else {message.react('❌')}
					message.reply(`${message.author} ruined the count!\nThe next number is **1** | **You cannot count more than one time in a row**!`)
					numb = 0
					lastCounterId = "0"
				}
				lecountr.increment('wrongNumbers');

			}

			guildDB.update({ count: numb })
		}

		//DEBUG - Reset server saves to 3
		if (message.content == "bruhbruhbruh"){
			message.channel.send("[DEBUG] restored server saves to 3")
			serverSaves = 3
		}
	}

});

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