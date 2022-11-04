const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription(`Get the counting leaderboard`)
		.addIntegerOption(option =>
			option.setRequired(false)
				.setName("page")
				.setDescription("The page of users to show (10 users/page) (Default: 1)")),
	async execute(interaction) {
		const db = interaction.client.db.Counters;
		const page = (interaction.options.getInteger("page") || 1) * 10;
		await interaction.deferReply();

		const rawList = await db.findAll({ attributes: ['numbers', 'userID'] })
		const sortedList = rawList.sort((a, b) => b.numbers - a.numbers)
		const slicedList = sortedList.slice((page - 10), page);

		const output = slicedList.map(lbUser =>{
			const user = interaction.guild.members.cache.get(lbUser.userID)

			return user ? `**#${((i + 1) + (page - 10)).toString()}** | \`${user.tag}\`: **${slicedList[i].numbers.toString()}**${(slicedList[i].userID == interaction.user.id ? ' < __You__' : '')}` : `**#${(i + 1).toString()}** | \`Unknown#${slicedList[i].userID}\`: **${slicedList[i].numbers.toString()}**${(slicedList[i].userID == interaction.user.id ? ' < __You__' : '')}`
		})

		const embed = new MessageEmbed()
			.setTitle(`ProgressCount95 Leaderboard | Page ${page / 10} (10 users/page)`)
			.setColor("#0099ff")
			.setDescription(output.join("\n"))
			.setTimestamp()

		return interaction.editReply({ content: "_ _", embeds: [embed] });
	},
};