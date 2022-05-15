const { SlashCommandBuilder } = require('@discordjs/builders');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setap-bitch-counter')
        .setDescription(`Get how many bitches Setap has.`),
    async execute(interaction) {
        await interaction.deferReply();
		await wait(2500);
        if (getRndInteger(1, 10) == 1) {
            await interaction.editReply('**Setap has -1 bitches.**');
        } else {
            await interaction.editReply('**Setap has 0 bitches.**');
        }
        return;
    },
};

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
  }