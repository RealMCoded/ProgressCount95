const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lb')
        .setDescription(`Get the leaderboard`)
        .addIntegerOption(option =>
            option.setName('numb')
            .setDescription(`The number of users to show (default: 10)`)
            .setRequired(false)),
    async execute(interaction) {
       //create a message embed
         const embed = new MessageEmbed()
            .setTitle("Leaderboard")
            .setColor("#0099ff")
            .setDescription("Here is the leaderboard!\n\n1: Frank | a lot of numbers\n\n2: Josh | some numbers\n\n3: Jimmy | very few numbers")
            .setTimestamp()
        //send the message embed
        return interaction.reply({ embed });
    },
};