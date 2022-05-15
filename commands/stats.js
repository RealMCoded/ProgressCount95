const { SlashCommandBuilder } = require('@discordjs/builders');
const {MessageEmbed} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription(`View user stats!`)
        .addUserOption(option => option.setName('user').setDescription('the chosen one').setRequired(false)),
    async execute(interaction) {
       interaction.reply({ content: "_ _", ephemeral: true }); //show nothing for now
    },
};