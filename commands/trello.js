const { SlashCommandBuilder } = require('@discordjs/builders');
const {MessageEmbed} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trello')
        .setDescription(`Get a link to the Trello board for the bot.`),
    async execute(interaction) {
       interaction.reply({ content: "Here's the Trello: https://trello.com/b/WMZYOuTd/progresscount95", ephemeral: true }); //show nothing for now
    },
};