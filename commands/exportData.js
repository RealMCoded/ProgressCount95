const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment } = require('discord.js');
const fs = require('node:fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('export-leaderboard')
		.setDescription(`Exports leaderboard as a JSON file`),
	async execute(interaction) {
		if(interaction.client.isDumping) {
			return interaction.reply("<:CountingWarn:981961793515716630> **The bot is currently generating a leaderboard file, please wait until this is finished before requesting.**")
		}
		interaction.client.isDumping = true
		await interaction.reply("<a:typing:1017890251236200569> **The file is being generated and will be sent to you soon!**")
		console.log(`${interaction.user.tag} requested leaderboard dump`)
		let db = interaction.client.db
		var data = new Array();

		/*
		data.push({
			userID: "User ID",
			numbers: "Numbers counted"
		})
		*/

		var list = await db.Counters.findAll({
			attributes: ['numbers', 'userID', 'wrongNumbers']
		})
	
	
		list = list.sort((a, b) => b.numbers - a.numbers)
	
		for(var i=0; i < list.length; i++){
			//console.log(`GOT ${list[i].userID} (${i+1} / ${list.length})`)
			//push the userID and numbers to the data array
			data.push({
				userID: list[i].userID,
				numbers: list[i].numbers,
			})
		}
		interaction.client.isDumping = false
		const dump = new MessageAttachment(Buffer.from(JSON.stringify(data)), "leaderboard.json")
		interaction.followUp({ content: `${interaction.user} Here's your leaderboard export file!`, files: [dump], ephemeral: true })

	},
};