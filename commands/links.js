const { SlashCommandBuilder } = require('@discordjs/builders');
const {MessageEmbed} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('links')
        .setDescription(`Some important links you might want to check out!`)
        .addSubcommand(subcommand => subcommand
            .setName("github")
            .setDescription("check out the source code of this hot mess"))
        .addSubcommand(subcommand => subcommand
            .setName("trello")
            .setDescription("look at the shit we need to still do")),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "github") {
            interaction.reply({ content: "Here's the Github: https://github.com/RealMCoded/ProgressCount95", ephemeral: true });
        } else if (subcommand === "trello") {
            interaction.reply({ content: "Here's the Trello: https://trello.com/b/WMZYOuTd/progresscount95", ephemeral: true });
        }
    },
};