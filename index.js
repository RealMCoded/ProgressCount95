const fs = require('node:fs');
const { Client, Collection, Intents } = require('discord.js');
const { token, countingCh, useCustomEmoji } = require('./config.json');

const client = new Client({ ws: { properties: { $browser: "Discord iOS" }}, intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

var numb = parseInt(fs.readFileSync('./data/numb.txt', 'utf8'))
var lastCounterId= "0"

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

client.once('ready', () => {
	console.log('Ready!\n');
	if (useCustomEmoji) {console.log("Custom Emoji support is on! Some emojis may fail to react if the bot is not in the server with the emoji.")} else {console.log("Custom Emoji support is off! No custom emojis will be used.")}
	client.user.setActivity('counting', { type: 'COMPETING' });
});

//All slash commands. check "commands" folder
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
		numb = parseInt(fs.readFileSync('./data/numb.txt', 'utf8'))
	} catch (error) {
		console.log(`${error}\n\n`)
		if (interaction.user.id !== "284804878604435476") {
            await interaction.reply({content: `if you are seeing this, <@284804878604435476> messed up somehow. send this error to him plz :)\n\n\`\`\`${btoa(error)}\`\`\``, ephemeral: true})
        } else {
            await interaction.reply({content: `wow good job you fucked something up (again)\n\n\`\`\`${error}\`\`\``, ephemeral: true})
        }
	}
});


client.on('messageCreate', async message => {

	if (message.author.bot) return

	if (message.channel.id === countingCh) {
		//Read file banned.json and store it in variable
		var fd = fs.readFileSync('./data/banned.json', 'utf8')
		if (fd.includes(message.author.id)) {
			return
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
							default: message.react("✅"); break;
						}
					} else {
						message.react("✅");
					}
					numb++
					lastCounterId = message.author.id
				} else {
					if (message.content.length >= 1500){
						message.reply("https://cdn.discordapp.com/attachments/875920385315577867/927848021968949268/Screenshot_20220103-225144.jpg?size=4096")
					} else {
						message.react('❌')
						message.reply(`${message.author} ruined the count!\nThe next number was **${numb+1}**, but they said **${thec}**!`)
						numb = 0
						lastCounterId = "0"
					}
				}
			}else {
				message.react('❌')
				message.reply(`${message.author} ruined the count!\n**You cannot count more than one time in a row**!`)
				numb = 0
				lastCounterId = "0"
			}

			//write changes to file
			fs.writeFile('./data/numb.txt', String(numb), (err) => {
				if (err) throw err;
			});
		}

		//i use arch btw counter - maybe later
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