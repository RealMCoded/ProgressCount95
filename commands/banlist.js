const fs = require('node:fs')
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banlist')
        .setDescription(`Look at all the dead people.`),
    async execute(interaction) {
        if (interaction.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) { //I'm using MANAGE_ROLES because it's a permission that is only available to all staff members - even helpers. This can be bumped to MANAGE_MEMBERS later.
            let banlist = '';
            const db = interaction.client.db.Bans;

            let bans = await db.findAll();
            if (bans.length == 0) {

            } else {
                for (let i = 0; i < bans.length; i++) {
                    let user = interaction.client.users.cache.get(bans[i].userID);
                    if (user) {
                        banlist += `**${user.username}#${user.discriminator}** - ${bans[i].reason}\n`
                    } else {
                        banlist += `**${bans[i].userID}** (no longer in guild) - ${bans[i].reason}\n`
                    }
                }
            }
            if (banlist == '') {
                banlist = '**No one is banned from counting.**'
            }
            //create message embed
            const embed = new MessageEmbed()
                .setTitle('List of banned members from Counting')
                .setDescription(banlist)
                .setColor('#ff0000')
            return interaction.reply({embeds: [embed]}); 
        } else {
            return interaction.reply({ content: `❌ **You cannot do this!**`, ephemeral: true });
        }
    },
};