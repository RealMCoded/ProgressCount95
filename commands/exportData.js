const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('node:fs')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('export-leaderboard')
		.setDescription(`Exports leaderboard as a JSON file`),
	async execute(interaction) {
		interaction.reply("<a:typing:1017890251236200569> **The file is being generated and will be DMd to you soon!**\n\n**Do not run this command as this process is happening, as it will break the bot.**")
		
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

		interaction.user.send(`\`\`\`json\n${JSON.stringify(data)}\n\`\`\``)
	},
};