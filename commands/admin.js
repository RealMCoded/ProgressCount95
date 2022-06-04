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
            .setDescription("Look at all the dead people."))
        .addSubcommand(subcommand => subcommand
            .setName("setuserscore")
            .setDescription("Set an user's correct and incorrect numbers.")
            .addUserOption(option => option
                .setName("user")
                .setDescription("the user")
                .setRequired(true))
            .addIntegerOption(option => option
                .setName("correct")
                .setDescription("the correct numbers")
                .setRequired(true))
            .addIntegerOption(option => option
                .setName("incorrect")
                .setDescription("the incorrect numbers")
                .setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName("sethighscore")
            .setDescription("set the high score")
            .addIntegerOption(option => option
                .setName("highscore")
                .setDescription("the highscore")
                .setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName("setusersaves")
            .setDescription("Set an user's saves.")
            .addUserOption(option => option
                .setName("user")
                .setDescription("the user")
                .setRequired(true))
            .addNumberOption(option => option
                .setName("saves")
                .setDescription("the number of saves")
                .setRequired(true))
            .addIntegerOption(option => option
                .setName("slots")
                .setDescription("the number of save slots"))),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand()
        if (interaction.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) { //I'm using MANAGE_ROLES because it's a permission that is only available to all staff members - even helpers. This can be bumped to MANAGE_MEMBERS later.
            if (subcommand == "setban") {
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
            } else if (subcommand == "setcount") {
                var numb = interaction.options.getInteger("count")

                interaction.client.numb = numb

                var numbdb = await interaction.client.db.Data.findOne({ where: { name: "numb" }})
                numbdb.update({ value: numb.toString() })

                console.log(`${interaction.user.tag} changed the number to ${numb}`)
                return interaction.reply({ content: `✅ **Set the count to ${numb}!**`, ephemeral: false });
            } else if (subcommand == "banlist") {
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
                return interaction.reply({embeds: [embed], ephemeral: true});
            } else if (subcommand == "setuserscore") {
                const user = interaction.options.getUser("user")
                const correctNumbers = interaction.options.getInteger("correct")
                const incorrectNumbers = interaction.options.getInteger("incorrect")
                const db = interaction.client.db.Counters
                const [row, created] = await db.findOrCreate({ where: { userID: user.id } })
                row.update({ wrongNumbers: incorrectNumbers, numbers: correctNumbers })
                console.log(`${interaction.user.tag} changed the score for ${user.tag} to ${correctNumbers} correct, ${incorrectNumbers} incorrect`)
                return interaction.reply({ content: `✅ **Changed the score for ${user.tag} to ${correctNumbers} correct, ${incorrectNumbers} incorrect.**`, ephemeral: true })
            } else if (subcommand == "setusersaves") {
                const user = interaction.options.getUser("user")
                const saves = interaction.options.getNumber("saves")
                const slots = interaction.options.getInteger("slots")
                const db = interaction.client.db.Saves
                let userSaves = await db.findOne({ where: { userID: user.id } });
                userSaves.update({ saves: saves })
                console.log(`${interaction.user.tag} changed saves for ${user.tag} to ${saves}`)
                return interaction.reply(`✅ **Changed saves for ${user.tag} to ${saves}.**`)
            }
        
        } else {
            return interaction.reply({ content: `❌ **You cannot do this!**`, ephemeral: true });
        }
    }

}