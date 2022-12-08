const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userconfig')
        .setDescription('User settings.')
        .addSubcommand(subcommand => subcommand
            .setName("claim-dm")
            .setDescription("Enable or disable being notified when you can claim saves.")
            .addBooleanOption(option => option
                .setName("value")
                .setDescription("Whether to be notified when you can claim saves.")
                .setRequired(true))),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand()
        const user = interaction.user
        switch(subcommand) {
            case "claim-dm": {
                const db = interaction.client.db.Counters
                const val = interaction.options.getBoolean("value")
                const [row,] = await db.findOrCreate({ where: { userID: interaction.user.id } })
                let config = JSON.parse(row.get('config'))
                console.log(`CONFIG BEFORE: ${JSON.stringify(config)}`)
                config.enableClaimDM = val
                console.log(`CONFIG AFTER: ${JSON.stringify(config)}`)
                await row.update({config: JSON.stringify(config)})
                interaction.reply({content: "✅ **Your user settings have been updated.**", ephemeral: true })
            }
            break;
        }   
    }
        
}