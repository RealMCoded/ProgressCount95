const { SlashCommandBuilder, codeBlock } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userconfig')
        .setDescription('User settings.')
        .addSubcommand(subcommand => subcommand
            .setName("claim-notifications")
            .setDescription("Enable or disable being notified when you can claim saves.")
            .addBooleanOption(option => option
                .setName("value")
                .setDescription("Whether to be notified when you can claim saves.")
                .setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName("view")
            .setDescription("View your current user settings (WIP)")),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand()
        const user = interaction.user
        switch(subcommand) {
            case "claim-notifications": {
                const db = interaction.client.db.Counters
                const val = interaction.options.getBoolean("value")
                const [row,] = await db.findOrCreate({ where: { userID: interaction.user.id } })
                let config = JSON.parse(row.get('config'))
                console.log(`CONFIG BEFORE: ${JSON.stringify(config)}`)
                config.enableClaimDM = val
                console.log(`CONFIG AFTER: ${JSON.stringify(config)}`)
                await row.update({config: JSON.stringify(config)})
                interaction.reply({content: "✅ **Your user settings have been updated.**", ephemeral: true })
            } break;
            case "view": {
                /*
                    TODO: PROPER FORMATTING FOR THIS INSTEAD OF THE RAW JSON FILE!!!
                */
                const db = interaction.client.db.Counters
                const val = interaction.options.getBoolean("value")
                const [row,] = await db.findOrCreate({ where: { userID: interaction.user.id } })
                interaction.reply({content: `${codeBlock("json", JSON.stringify(JSON.parse(row.get("config")), null, 2))}`, ephemeral: true })
            }
        }   
    }
        
}