const { SlashCommandBuilder, codeBlock } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { formattedName } = require('../Util.js')

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
            .setDescription("View your current user settings")),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand()
        const user = interaction.user
        switch(subcommand) {
            case "claim-notifications": {
                const db = interaction.client.db.Counters
                const val = interaction.options.getBoolean("value")
                const [row,] = await db.findOrCreate({ where: { userID: interaction.user.id } })
                let config = JSON.parse(row.get('config'))
                let oldconf = JSON.parse(row.get('config'))
                config.enableClaimDM = val

                if (config.enableClaimDM == oldconf.enableClaimDM) {return interaction.reply({content: `⚠️ **Your user settings have not been updated because this setting already equaled this value!**`, ephemeral: true })}
                await row.update({config: JSON.stringify(config)})
                interaction.reply({content: `✅ **Your user settings have been updated.**\n${codeBlock("diff", `- enableClaimDM: ${oldconf.enableClaimDM}\n+ enableClaimDM: ${config.enableClaimDM}`)}`, ephemeral: true })
            } break;
            case "view": {
                const db = interaction.client.db.Counters
                const [row,] = await db.findOrCreate({ where: { userID: interaction.user.id } })
                let config = JSON.parse(row.get('config'))

                const embed = new MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle(`User Configuration for ${formattedName(interaction.user)}`)
                    .addFields(
                        { name: `claim-notifications: ${(config.enableClaimDM == true ? "✅" : "❌")}`, value: `Enable claim notifcations from the bot.`},
                    )

                await interaction.reply({embeds: [embed]});
            }
        }   
        return;
    }
        
}