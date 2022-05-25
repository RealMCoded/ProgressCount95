const { SlashCommandBuilder } = require('@discordjs/builders');
const {MessageEmbed} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('saves')
        .setDescription(`View and claim saves!`)
        .addSubcommand(subcommand =>
			subcommand
			.setName("claim")
			.setDescription("Claim your saves!"))
        .addSubcommand(subcommand =>
			subcommand
			.setName("view")
			.setDescription("View your saves!")),
    async execute(interaction) {
       return interaction.reply({ content: "_ _", ephemeral: true }); //show nothing for now
    },
};