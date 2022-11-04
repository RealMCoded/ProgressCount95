const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('days-since-last-js-framework')
        .setDescription(`How many days since the last JavaScript framework?`),
    private: true,
    async execute(interaction) {
        await interaction.deferReply();
		await wait(1500);

        const embed = new MessageEmbed()
			.setColor('#0099ff')
			.setTitle('It has been 0 days since the last JavaScript framework was released.')
            .setFooter({text:'Updated daily!'})

		await interaction.editReply({embeds: [embed]});
    },
};