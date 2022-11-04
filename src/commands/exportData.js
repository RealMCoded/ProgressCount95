const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment } = require('discord.js');
const { customEmojiList, useCustomEmoji } = require("../config.json")
const logger = require("../utils/logger.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('export-leaderboard')
		.setDescription(`Export the leaderboard as a JSON file`),
	async execute(interaction) {
		const db = interaction.client.db

		await interaction.reply(useCustomEmoji ? `${customEmojiList.typing} **The file is being generated and will be sent to you soon!**` : "••• **The file is being generated and will be sent to you soon!**")
	
		logger.log(`${interaction.user.tag} requested a leaderboard dump`)
	
		const list = await db.Counters.findAll({
			attributes: ['numbers', 'userID']
		})
		const sortedList = list.sort((a, b) => b.numbers - a.numbers)
	
		const data = {
			leaderboard:sortedList,
			server_count: sortedList.reduce((a, b) => a + b.numbers, 0),
			info:{
				export_date: Date.now(),
				guildID: interaction.guild.id,
				requested_by: interaction.user.id
			}
		}

		const dump = new MessageAttachment(Buffer.from(JSON.stringify(data, null, 2)), "leaderboard.json")
		interaction.followUp({ content: `✅ **Here is the exported leaderboard file!**`, files: [dump], ephemeral: true })
		interaction.editReply("✅ **Done!**")
	},
};