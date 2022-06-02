const fs = require('node:fs')
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageEmbed } = require('discord.js');

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
                .setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName("banlist")
            .setDescription("Look at all the dead people.")),
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
                            await db.findOrCreate({ where: { userID: mbr.id }, defaults: { reason: reason} })
                            interaction.reply(`✅ **Banned ${mbr.username}#${mbr.discriminator} from counting for "${interaction.options.getString("reason")}".**`)
                        } else {
                            await db.destroy({ where: { userID: mbr.id } })
                            interaction.reply(`✅ **Unbanned ${mbr.username}#${mbr.discriminator} from counting.**`)

                        }
                    }
                case "setcount":
                    var numb = interaction.options.getInteger("count")

                    var numbdb = await interaction.client.db.Data.findOne({ where: { name: "numb" }})
		            numbdb.update({ value: numb.toString() })

                    console.log(`${interaction.user.tag} changed the number to ${numb}`)
                    return interaction.reply({ content: `✅ **Set the count to ${numb}!**`, ephemeral: false });
                case "banlist":
                    let banlist = '';
                    const db = interaction.client.db.Bans;

                    let bans = await db.findAll();
                    if (bans.length == 0) {

                    } else {
                        for (let i = 0; i < bans.length; i++) {
                            //TODO: Fix caching.
                            let user = await interaction.client.users.cache.get(bans[i].userID);
                            if (user) {
                                banlist += `**${user.username}#${user.discriminator}** - ${bans[i].reason}\n`
                            } else {
                                banlist += `**<@${bans[i].userID}>**  - ${bans[i].reason}\n`
                            }
                        }
                    }      
                    if (banlist == '') {
                        banlist = '**No one is banned from counting.**'
                    }
                    //create message embed
                    const embed = new MessageEmbed()
                        .setTitle('List of banned members from Counting - Work in progress')
                        .setDescription(banlist)
                        .setColor('#ff0000')
                    return interaction.reply({embeds: [embed]}); 
            }
        
        } else {
            return interaction.reply({ content: `❌ **You cannot do this!**`, ephemeral: true });
        }
    }

}