const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('about')
        .setDescription(`About the bot`),
    async execute(interaction) {
        const currentTimestamp = Math.round(+new Date() / 1000);
        const timestampColour = currentTimestamp.toString(16).substring(2, 10);
        const embed = new MessageEmbed()
            .setTitle('ProgressCount95')
            .setDescription(`Version 0.1.0\n\nBot created by <@284804878604435476>`)
            .setColor(`${timestampColour}`);
        await interaction.reply({embeds: [embed]});
    },
};