const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('uptime')
		.setDescription(`get how long the bot has been online`),
	execute(interaction) {
		const embed = new MessageEmbed()
			.setColor('#0099ff')
			.setTitle(`The bot has been online for ${(Math.round(process.uptime() * 100) / 100) / 60} minutes.`)

		interaction.reply({ embeds: [embed] });
	},
};