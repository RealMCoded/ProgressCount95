const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('node:fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rules')
        .setDescription(`Read the bot's rules!`),
    async execute(interaction) {

        const rules = fs.readFileSync('./rules.txt',{encoding:'utf8', flag:'r'})

        interaction.reply({content : rules , ephemeral: true })
    },
};