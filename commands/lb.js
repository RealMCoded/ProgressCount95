const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription(`Get the leaderboard`)
        .addIntegerOption(option =>
            option.setName('numb')
            .setDescription(`The number of users to show (default: 10)`)
            .setRequired(false)),
    async execute(interaction) {
        const db = interaction.client.db.Counters;

        var le = ""
        list = await db.findAll({
            attributes: ['numbers', 'userID']
          })

        list = list.sort((a, b) => b.numbers - a.numbers)
        list = list.slice(0, interaction.options.getInteger('numb') || 10)

        for(var i=0; i < list.length; i++){
            var le = le + "**#" + (i+1).toString() + "** | <@" + list[i].userID + ">: **" + list[i].numbers.toString() + "**\n"
        }

        const embed = new MessageEmbed()
            .setTitle(`Leaderboard | First ${interaction.options.getInteger('numb') || 10} users`)
            .setColor("#0099ff")
            .setDescription(`${le}`)
            .setTimestamp()

		return interaction.reply({embeds: [embed]});
    },
};