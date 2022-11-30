const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('christmas')
        .setDescription(`How many days until Christmas?`),
    private: true,
    async execute(interaction) {

        const datestamp = '1671926400'

        const embed = new MessageEmbed()
			.setColor('#FF0000')
			.setTitle('Days until Christmas')
            .setDescription(`Placeholder Placeholder blah blah blah.`)
            .setThumbnail('https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/350/christmas-tree_1f384.png')
            //.setFooter({text:'Updated daily!'})

		await interaction.editReply({embeds: [embed]});
    },
};