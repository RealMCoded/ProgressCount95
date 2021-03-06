const fs = require('node:fs')
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('count')
        .setDescription(`Get the current count`),
        //.addIntegerOption(option => option.setName('numb').setDescription('the number').setRequired(true)),
    async execute(interaction) {

        const guildDB = await interaction.client.db.Data.findOne({ where: { guildID: interaction.guild.id }});
        let numb = await interaction.client.db.Data.findOne()
        let lastCounter = await interaction.client.users.fetch(guildDB.lastCounterID)
        return interaction.reply({ content: `The current number is **${numb.count}** and was last counted by ${lastCounter}.`, ephemeral: true });
    },
};