const { SlashCommandBuilder } = require('@discordjs/builders');
const rules = require("../messages/rules.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rules')
        .setDescription(`Read the bot's rules!`),
    execute(interaction) {
        interaction.reply({ content: rules.text, ephemeral: true })
    },
};