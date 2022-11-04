// import files
const { nerdstatExecutor } = require('../config.json');
const logger = require("../utils/logger.js")

module.exports.eventLogic = async (interaction, client) => {
	if (!interaction.isCommand() || !client.commands.has(interaction.commandName)) return;
	const command = client.commands.get(interaction.commandName);

	try {
		await command.execute(interaction);
	} catch (error) {
		logger.log(`${error}\n\n`)
		if (!nerdstatExecutor.includes(interaction.user.id)) {
			await interaction.reply({ content: `if you are seeing this, one of the devs messed up somehow. send this error to them plz :)\n\n\`\`\`${error}\`\`\``, ephemeral: true })
		} else {
			await interaction.reply({ content: `Something bad happened! \n\n\`\`\`${error}\`\`\``, ephemeral: true })
		}
	}
}

module.exports.recurring = true