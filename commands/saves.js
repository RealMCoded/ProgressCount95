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
            .setName("99")
            .setDescription("Admin and debug use only! gives you 99 saves")),
    async execute(interaction) {
        const db = interaction.client.db.Saves;
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === "claim") {
            return interaction.reply({ content: "_ _", ephemeral: true }); //show nothing for now
        } else if (subcommand === "view") {
            return interaction.reply({ content: "_ _", ephemeral: true }); //show nothing for now
        } else if (subcommand === "99") {
            db.create({
                saves: 99,
                userID: interaction.member.user.id,
            })
            return interaction.reply({ content: "k", ephemeral: true }); //show nothing for now
        }
    },
};