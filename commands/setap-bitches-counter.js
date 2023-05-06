const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setap-bitch-counter')
        .setDescription(`How many bitches does Setap have?`),
    private: true,
    async execute(interaction) {
        await interaction.deferReply();
		await wait(1500);

        var date = new Date(new Date().getTime() - 120 * 1000).toISOString()

        const embed = new MessageEmbed()
			.setColor('#0099ff')
			.setTitle(`Setap has 0 bitches.`)
            .setFooter({text:'Updated hourly!'})
            .setTimestamp(date)

		await interaction.editReply({embeds: [embed]});
    },
};