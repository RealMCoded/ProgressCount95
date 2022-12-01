const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription(`Get the counting leaderboard`)
		.addSubcommand(subcommand => subcommand
            .setName("corrects")
            .setDescription("Counting leaderboard. Based on correct numbers only.")
            .addIntegerOption(option => 
				option.setRequired(false)
					.setName("page")
					.setDescription("The page of users to show (10 users/page) (Default: 1)")))
		.addSubcommand(subcommand => subcommand
            .setName("score")
            .setDescription("Counting leaderboard. Based on score (corrects - incorrects).")
            .addIntegerOption(option => 
				option.setRequired(false)
					.setName("page")
					.setDescription("The page of users to show (10 users/page) (Default: 1)"))),
    async execute(interaction) {
        const db = interaction.client.db.Counters;
		const subcommand = interaction.options.getSubcommand()
        const page = (interaction.options.getInteger("page") || 1)*10;
		await interaction.deferReply();

		var timr = setTimeout(() => {
            // notify the user why it's taking so damn long
            interaction.editReply(`***This is taking longer than expected, which is normal if you are requesting a leaderboard page right after someone requested one.\n\n(We're at ${gli}/${list.length} users btw!)***`);
        }, 10000);
			var le = ""

			var list;

			if(subcommand == "corrects") {
				list = await db.findAll({
					attributes: ['numbers', 'userID']
				})
			} else if (subcommand == "score") {
				list = await db.findAll({
					attributes: ['numbers', 'wrongNumbers', 'userID']
				})

				for(var i=0; i < list.length; i++){
					list[i].numbers = list[i].numbers - list[i].wrongNumbers
				}
			}

			list = list.sort((a, b) => b.numbers - a.numbers)

			list = list.slice((page-10), page);

			for(var i=0; i < list.length; i++){
				//TODO: Prevent rate limiting for this, causing it to hang. - mildly fixed
				var gli = i

				let theScore = list[i].numbers.toString()

				let user = await interaction.client.users.fetch(list[i].userID);
				if(user){
					var le = le + "**#" + ((i+1)+(page-10)).toString() + "** | `" + user.tag + "`: **" + theScore + "**" + (list[i].userID == interaction.user.id ? ' < __You__' : '') + "\n"
				} else {
					var le = le + "**#" + (i+1).toString() + "** | `Unknown#" + list[i].userID + "`: **" + theScore + "**" + (list[i].userID == interaction.user.id ? ' < __You__' : '') + "\n"
				}
				await wait(250);
			}

			const embed = new MessageEmbed()
                .setTitle(`ProgressCount95 Leaderboard | Based on ${subcommand} | Page ${page/10} (10 users/page)`)
				.setColor("#0099ff")
				.setDescription(`${le}`)
				.setTimestamp()

			clearTimeout(timr)
			return interaction.editReply({ content:"_ _", embeds: [embed]});
    },
};