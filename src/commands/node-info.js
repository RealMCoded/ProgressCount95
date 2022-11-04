const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('node-info')
		.setDescription(`Get ram usage, uptime, and more.`),
	async execute(interaction) {
			//store node memory usage
			const mem = `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100} MB`;
			//store node uptime
			const uptime = `${(Math.round(process.uptime() * 100) / 100)/60} seconds`;
			//store node version
			const version = `${process.version}`;
			//store node platform
			const platform = `${process.platform}`;
			//store node arch
			const arch = `${process.arch}`;
			//store node cpu count
			//const cpuCount = `${process.cpuCount()}`;
			//store node cpu speed
			const cpuSpeed = `${Math.round(process.cpuUsage().system / 1000 / 1000 * 100) / 100} MHz`;
			//store node total cpu usage
			const cpuUsage = `${Math.round(process.cpuUsage().user / 1000 / 1000 * 100) / 100} MHz`;
			const ping = `${interaction.client.ws.ping}`;

			//create new MessageEmbed
			const embed = new MessageEmbed()
				.setColor('#0099ff')
				.setTitle('Node Info')
				.setDescription(
					`**Memory Usage**: \`${mem}\`\n**Uptime**: \`${uptime}\`\n**Version**: \`${version}\`\n**Platform**: \`${platform}\`\n**Architecture**: \`${arch}\`\n**CPU Speed**: \`${cpuSpeed}\`\n**CPU Usage**: \`${cpuUsage}\`\n**Ping**: \`${ping}\``
				);

			await interaction.reply({embeds: [embed], ephemeral: true });
	},
};
