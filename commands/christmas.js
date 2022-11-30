const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('christmas')
        .setDescription(`How many days until Christmas?`),
    private: true,
    async execute(interaction) {

        const date = new Date()

        const datestamp = '1671926400' //UTC

        const embed = new MessageEmbed()
			.setColor(Math.random() < 0.5 ? '#00FF00' : '#FF0000')
			.setTitle('Days until Christmas')
            .setDescription(date.getDate() > 24 ? `🎄 **CHRISTMAS IS TODAY!!!** 🎄` : `🎄 Christmas is <t:${datestamp}:R>! 🎄`)
            .setThumbnail('https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/350/christmas-tree_1f384.png')

		await interaction.reply({embeds: [embed]});
    },
};