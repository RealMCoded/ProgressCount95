const { SlashCommandBuilder } = require('@discordjs/builders');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setap-bitch-counter')
        .setDescription(`Get how many bitches Setap has.`),
    async execute(interaction) {
        await interaction.deferReply();
		await wait(2500);
        var rndint = getRndInteger(1, 20) 
        if (rndint == 1) {
            await interaction.editReply('**Setap has -1 bitches.**');
        } else if (rndint == 10) {
            await interaction.editReply('**Setap has 1 bitch.**');
            await wait(2500);
            await interaction.editReply('~~**Setap has 1 bitch.**~~\n\nMy bad, it\'s still 0.');
        } else {
            await interaction.editReply('**Setap has 0 bitches.**');
        }
        return;
    },
};

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}