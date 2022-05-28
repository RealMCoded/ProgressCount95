const { SlashCommandBuilder } = require('@discordjs/builders');
const {MessageEmbed} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('saves')
        .setDescription(`save cmd`)
        .addSubcommand(subcommand =>
			subcommand
			.setName("claim")
			.setDescription("Claim your saves!"))
        .addSubcommand(subcommand =>
			subcommand
			.setName("view")
			.setDescription("View your saves!"))
        .addSubcommand(subcommand =>
            subcommand
            .setName("set")
            .setDescription("Admin and debug use only! Set your saves")),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === "claim") {
            return interaction.reply({ content: "_ _", ephemeral: true }); //show nothing for now
        } else if (subcommand === "view") {
            return interaction.reply({ content: "_ _", ephemeral: true }); //show nothing for now
        } else if (subcommand === "set") {
            return interaction.reply({ content: "_ _", ephemeral: true }); //show nothing for now
        }
    },
};