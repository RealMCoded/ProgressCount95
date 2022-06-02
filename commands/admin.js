const fs = require('node:fs')
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

module.exports = { 
    data: new SlashCommandBuilder()
        .setName("admin")
        .setDescription("Admin-only commands for the bot.")
        .addSubcommand(subcommand => subcommand
            .setName("setcount")
            .setDescription("Set the current count.")
            .addIntegerOption(option => option
                .setName("count")
                .setDescription("The new count.")
                .setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName("setban")
            .setDescription("Set or unset a ban on a user.")
            .addUserOption(option => option
                .setName("user")
                .setDescription("the user")
                .setRequired(true))
            .addBooleanOption(option => option
                .setName("ban")
                .setDescription("whether to ban or not this user")
                .setRequired(true))
            .addStringOption(option => option
                .setName("reason")
                .setDescription("the reason for the ban. Unused for unbans.")
                .setRequired(true))),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand()
        if (interaction.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) { //I'm using MANAGE_ROLES because it's a permission that is only available to all staff members - even helpers. This can be bumped to MANAGE_MEMBERS later.
            switch(subcommand) {
                case "setban":
                    let mbr = interaction.options.getUser("user")
                    let ban = interaction.options.getBoolean("ban")
                    let reason = interaction.options.getString("reason")
                    if (mbr == "513487616964952084") {
                        return interaction.reply("❌ **What did i ever do to you?**")
                    } else {
                        const db = interaction.client.db.Bans;
                        if (ban) {
                            await db.findOrCreate({ where: { userID: mbr.id } })
                            interaction.reply(`✅ **Banned ${mbr.username}#${mbr.discriminator} from counting for "${interaction.options.getString("reason")}".**`)
                        } else {
                            await db.destroy({ where: { userID: mbr.id } })
                            interaction.reply(`✅ **Unbanned ${mbr.username}#${mbr.discriminator} from counting.**`)

                        }
                    }
            }
        
        }
    }

}