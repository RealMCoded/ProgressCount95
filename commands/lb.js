const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription(`Get the leaderboard`)
        .addIntegerOption(option => 
            option.setRequired(false)
                .setName("page")
                .setDescription("The page of users to show (10 users/page) (Default: 1)")),
    async execute(interaction) {
        const db = interaction.client.db.Counters;
        const page = (interaction.options.getInteger("page") || 1)*10;
		await interaction.deferReply();

		var timr = setTimeout(() => {
            // notify the user why it's taking so damn long
            interaction.editReply(`***This is taking longer than expected, which is normal if you are requesting a leaderboard page right after someone requested one.\n\n(We're at ${gli}/${list.length} users btw!)***`);
        }, 10000);
			var le = ""
			list = await db.findAll({
				attributes: ['numbers', 'userID']
			})

			list = list.sort((a, b) => b.numbers - a.numbers)
			list = list.slice((page-10), page);

			for(var i=0; i < list.length; i++){

				//TODO: Prevent rate limiting for this, causing it to hang. - mildly fixed
				var gli = i
				let user = await interaction.client.users.fetch(list[i].userID);
				if(user){
					var le = le + "**#" + ((i+1)+(page-10)).toString() + "** | `" + user.tag + "`: **" + list[i].numbers.toString() + "**\n"
				} else {
					var le = le + "**#" + (i+1).toString() + "** | `Unknown#" + list[i].userID + "`: **" + list[i].numbers.toString() + "**\n"
				}
				await wait(250);
			}

			const embed = new MessageEmbed()
                .setTitle(`Counting Leaderboard | Page ${page/10} (10 users/page)`)
				.setColor("#0099ff")
				.setDescription(`${le}`)
				.setTimestamp()

			clearTimeout(timr)
			return interaction.editReply({ content:"_ _", embeds: [embed]});
    },
};