const fs = require('node:fs')
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban-count-toggle')
        .setDescription(`Ban a user from counting. Run again to unban.`)
        .addUserOption(option => option.setName('user').setDescription('the user').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('the reason for the ban. Unused for unbans.').setRequired(true)),
    async execute(interaction) {
        if (interaction.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) { //I'm using MANAGE_ROLES because it's a permission that is only available to all staff members - even helpers. This can be bumped to MANAGE_MEMBERS later.
            let mbr = interaction.options.getUser("user")
            if (mbr == "513487616964952084") {
                return interaction.reply("❌ **What did i ever do to you?**")
            } else if (mbr == "511223071504334866") {
                return interaction.reply("❌ **You cannot ban my creator from counting smh**")
            } else {
                const db = interaction.client.db.Bans;
                let ban = await db.findOne({ where: { userID: mbr.id } });
                if (ban) {
                    await db.destroy({ where: { userID: mbr.id } })
                    interaction.reply(`✅ **Unbanned ${mbr.username}#${mbr.discriminator} from counting.**`)
                } else {
                    await db.create({
                        userID: mbr.id,
                        reason: interaction.options.getString("reason")
                    })
                    interaction.reply(`✅ **Banned ${mbr.username}#${mbr.discriminator} from counting for "${interaction.options.getString("reason")}".**`)
                }

                console.log(`${interaction.user.tag} banned ${mbr}`)
            }
        } else {
            return interaction.reply({ content: `❌ **You cannot do this!**`, ephemeral: true });
        }
    },
};
