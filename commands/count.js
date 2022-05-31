const fs = require('node:fs')
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('count')
        .setDescription(`Get the current count`),
        //.addIntegerOption(option => option.setName('numb').setDescription('the number').setRequired(true)),
    async execute(interaction) {
            let numb = await interaction.client.db.Data.findOne({ where: { name: "numb" }})
            return interaction.reply({ content: `The current number is **${numb.get('value')}**`, ephemeral: true });
    },
};