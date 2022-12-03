const { SlashCommandBuilder } = require('@discordjs/builders');
const { enableRulesFile } = require('../config.json')
const fs = require('node:fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rules')
        .setDescription(`Read the bot's rules!`),
    async execute(interaction) {
        if (enableRulesFile) {
            const rules = fs.readFileSync('./rules.txt',{encoding:'utf8', flag:'r'})
            interaction.reply({content : rules , ephemeral: true })
        } else {
            interaction.reply({content : `❌ **The instance host has disabled the rules file.**`, ephemeral: true })
        }
    },
};