const { SlashCommandBuilder } = require('@discordjs/builders');
const {MessageEmbed} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('links')
        .setDescription(`Some important links you might want to check out!`)
        .addSubcommand(subcommand => subcommand
            .setName("github")
            .setDescription("Check out the source code for the bot!"))
        .addSubcommand(subcommand => subcommand
            .setName("trello")
            .setDescription("Future improvements coming to the bot!"))
        .addSubcommand(subcommand => subcommand
            .setName("privacy-policy")
            .setDescription("Read the bot's privacy policy.")),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "github") {
            interaction.reply({ content: "Here's the Github: https://github.com/RealMCoded/ProgressCount95", ephemeral: true });
        } else if (subcommand === "trello") {
            interaction.reply({ content: "Here's the Trello: https://trello.com/b/WMZYOuTd/progresscount95", ephemeral: true });
        }else if (subcommand === "privacy-policy") {
            interaction.reply({ content: "Here's the Privacy Policy: https://github.com/RealMCoded/ProgressCount95/blob/master/PRIVACY-POLICY.MD", ephemeral: true });
        }
    },
};