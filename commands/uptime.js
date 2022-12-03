const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('uptime')
		.setDescription(`get how long the bot has been online`),
	async execute(interaction) {
		const uptime = `${Math.floor((Math.round(process.uptime() * 100) / 100)/60)} minutes`;

		const embed = new MessageEmbed()
			.setColor('#0099ff')
			.setTitle(`The bot has been online for ${uptime}.`)

		await interaction.reply({embeds: [embed]});
	},
};