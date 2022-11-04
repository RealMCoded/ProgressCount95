const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('days-since-last-js-framework')
        .setDescription(`How many days since the last JavaScript framework?`),
    private: true,
    execute(interaction) {
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('It has been 0 days since the last JavaScript framework was released.')
            .setFooter({ text: 'Updated daily!' })

        interaction.reply({ embeds: [embed] });
    },
};