const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription(`Get the leaderboard`)
        .addIntegerOption(option =>
            option.setName('numb')
            .setDescription(`The number of users to show (default: 10)`)
            .setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply();
        const lenum = interaction.options.getInteger('numb') || 10
        if(lenum < 1) {
            interaction.reply({ content: `❌ **Provide a number greater than 0!**`, ephemeral: true });
            return;
        }
        const db = interaction.client.db.Counters;

        var le = ""
        list = await db.findAll({
            attributes: ['numbers', 'userID']
        })

        list = list.sort((a, b) => b.numbers - a.numbers)
        list = list.slice(0, lenum)

        for(var i=0; i < list.length; i++){
            let user = await interaction.client.users.fetch(list[i].userID) 
            var le = le + "**#" + (i+1).toString() + "** | `" + user.tag + "`: **" + list[i].numbers.toString() + "**\n"
            await wait(250); //add this, acts as a cooldown for rate limiting
        }

        const embed = new MessageEmbed()
            .setTitle(`Counting Leaderboard | First ${lenum} counters`)
            .setColor("#0099ff")
            .setDescription(`${le}`)
            .setTimestamp()

		return interaction.editReply({embeds: [embed]});
    },
};