const fs = require('node:fs')
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('count')
        .setDescription(`Get the current count`),
        //.addIntegerOption(option => option.setName('numb').setDescription('the number').setRequired(true)),
    async execute(interaction) {
            let numb = fs.readFileSync('./data/numb.txt', 'utf8')
            return interaction.reply({ content: `The current number is **${numb}**`, ephemeral: true });
    },
};