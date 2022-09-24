const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('export-leaderboard')
		.setDescription(`Exports leaderboard as a CSV file`),
	async execute(interaction) {
		interaction.reply("<a:typing:1017890251236200569> **The file is being generated and will be DMd to you soon!**\n\n**Do not run this command as this process is happening, as it will break the bot.**")
	},
};