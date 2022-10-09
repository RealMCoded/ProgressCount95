const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token, clientId, guildId } = require('./config.json');
const fs = require('node:fs');

console.log(`⚠️ This does not refresh global commands!\n`);

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
	try {
		console.log(`🔃 Refreshing ${commands.length} commands...`);

		await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);
		//console.error(commands);
		console.log(`✅ Successfully refreshed ${commands.length} commands!`);
	} catch (error) {
		console.error(error);
	}
})();