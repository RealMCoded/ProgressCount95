const fs = require('node:fs')
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageEmbed } = require('discord.js');
const { adminCommandPermission, countingCh } = require("./../config.json")
const { formattedName } = require('../Util.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("admin")
        .setDescription("Admin-only commands for the bot.")
        .addSubcommand(subcommand => subcommand
            .setName("setcount")
            .setDescription("Set the current count.")
            .addIntegerOption(option => option
                .setName("count")
                .setDescription("The new count")
                .setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName("setban")
            .setDescription("Set or unset a ban on a user.")
            .addUserOption(option => option
                .setName("user")
                .setDescription("The user to ban")
                .setRequired(true))
            .addBooleanOption(option => option
                .setName("ban")
                .setDescription("Whether to ban or not this user")
                .setRequired(true))
            .addStringOption(option => option
                .setName("reason")
                .setDescription("The reason for the ban. Unused for unbans.")
                .setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName("updateban")
            .setDescription("Update the ban reason for a user")
            .addUserOption(option => option
                .setName("user")
                .setDescription("The user you want to update the ban reason for")
                .setRequired(true))
            .addStringOption(option => option
                .setName("reason")
                .setDescription("The reason for the ban.")
                .setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName("banlist")
            .setDescription("View all of the people banned from the bot."))
        .addSubcommand(subcommand => subcommand
            .setName("setuserscore")
            .setDescription("Set an user's correct and incorrect numbers.")
            .addUserOption(option => option
                .setName("user")
                .setDescription("The user you want to set the numbers for")
                .setRequired(true))
            .addIntegerOption(option => option
                .setName("correct")
                .setDescription("The correct numbers")
                .setRequired(true))
            .addIntegerOption(option => option
                .setName("incorrect")
                .setDescription("The incorrect numbers")
                .setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName("sethighscore")
            .setDescription("Set the server high score")
            .addIntegerOption(option => option
                .setName("highscore")
                .setDescription("The high score")
                .setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName("setusersaves")
            .setDescription("Set an user's saves.")
            .addUserOption(option => option
                .setName("user")
                .setDescription("The user you want to give the saves to")
                .setRequired(true))
            .addNumberOption(option => option
                .setName("saves")
                .setDescription("The number of saves")
                .setRequired(true))
            .addIntegerOption(option => option
                .setName("slots")
                .setDescription("The number of save slots")))
        .addSubcommand(subcommand => subcommand
            .setName("setguildsaves")
            .setDescription("Set the guild's saves.")
            .addNumberOption(option => option
                .setName("saves")
                .setDescription("The number of saves")
                .setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName("resetclaimcooldown")
            .setDescription("Reset a user's save claim cooldown")
            .addUserOption(option => option
                .setName("user")
                .setDescription("The user you want to clear the cooldown from")
                .setRequired(true))),
    async execute(interaction) {
        //const webhookClient = new WebhookClient({ url: logHook });
        const subcommand = interaction.options.getSubcommand()
        if (interaction.member.permissions.has(Permissions.FLAGS[adminCommandPermission])) return interaction.reply({ content: `❌ **You must have the \`${adminCommandPermission}\` permission to run this command!**`, ephemeral: true });
        switch (subcommand) {
            case "setban": {
                let mbr = await interaction.client.users.fetch(interaction.options.getUser("user"))
                let ban = interaction.options.getBoolean("ban")
                let reason = interaction.options.getString("reason")
                if (mbr.id == interaction.client.user.id) return interaction.reply("❌ **What did I ever do to you?**")

                const db = interaction.client.db.Counters;
                const [row,] = await db.findOrCreate({ where: { userID: mbr.id } })
                if (ban) {
                    await row.update({ banReason: reason, banned: true })
                    interaction.reply(`✅ **Banned ${formattedName(mbr)} from counting for "${interaction.options.getString("reason")}".**`)
                    console.log(`${formattedName(interaction.user)} has banned ${formattedName(mbr)} from counting for "${interaction.options.getString("reason")}".`);
                    return;
                }

                await row.update({ banReason: null, banned: false })
                interaction.reply(`✅ **Unbanned ${formattedName(mbr)} from counting.**`)
                console.log(`${formattedName(interaction.user)} has unbanned ${formattedName(mbr)} from counting.`);

                break;
            }
            case "updateban": {
                let mbr = await interaction.client.users.fetch(interaction.options.getUser("user"))
                let reason = interaction.options.getString("reason")
                if (mbr.id == interaction.client.user.id) return interaction.reply("❌ **What did I ever do to you?**")

                const db = interaction.client.db.Counters;
                const row = await db.findOne({ where: { userID: mbr.id } })
                if (!row) return interaction.reply({ content: `❌ **This person is not banned from counting!**`, ephemeral: true });

                await row.update({ banReason: reason })
                interaction.reply(`✅ **Updated ban reason for ${formattedName(mbr)} to "${interaction.options.getString("reason")}".**`)
                console.log(`${formattedName(interaction.user)} has updated the ban reason for ${formattedName(mbr)} to "${interaction.options.getString("reason")}".`);

                break;
            }
            case "setcount": {
                var numb = interaction.options.getInteger("count")

                //interaction.numb = numb //it no work

                var numbdb = await interaction.client.db.Data.findOne()
                numbdb.update({ count: numb.toString() })

                console.log(`${formattedName(interaction.user)} changed the number to ${numb}`)
                await interaction.client.channels.cache.get(countingCh).send(`⚠️ The count was changed to **${numb}**! The next number is **${numb + 1}**`)
                return interaction.reply({ content: `✅ **Set the count to ${numb}!**`, ephemeral: false });

            }
            case "banlist": {
                let banlist = '';
                const db = interaction.client.db.Counters;

                let bans = await db.findAll({ where: { banned: true } });
                if (bans.length == 0) {
                    banlist = '**No one is banned from counting (yet).**'
                } else {
                    for (let i = 0; i < bans.length; i++) {
                        //TODO: Fix caching.
                        let user = await interaction.client.users.fetch(bans[i].userID);
                        if (user) {
                            banlist += `**${formattedName(user)}** - ${bans[i].banReason}\n`
                        } else {
                            banlist += `**<@${bans[i].userID}>**  - ${bans[i].banReason}\n`
                        }
                    }
                }
                //create message embed
                const embed = new MessageEmbed()
                    .setTitle('List of members banned from counting')
                    .setDescription(banlist)
                    .setColor('#ff0000')
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }
            case "setuserscore": {
                const user = await interaction.client.users.fetch(interaction.options.getUser("user"))
                const correctNumbers = interaction.options.getInteger("correct")
                const incorrectNumbers = interaction.options.getInteger("incorrect")
                const db = interaction.client.db.Counters

                const [row,] = await db.findOrCreate({ where: { userID: user.id } })
                await row.update({ wrongNumbers: incorrectNumbers, numbers: correctNumbers })

                console.log(`${formattedName(interaction.user)} changed the score for ${formattedName(user)} to ${correctNumbers} correct, ${incorrectNumbers} incorrect`)
                return interaction.reply({ content: `✅ **Changed the score for ${formattedName(user)} to ${correctNumbers} correct, ${incorrectNumbers} incorrect.**`, ephemeral: true })
            }
            case "setusersaves": {
                const user = await interaction.client.users.fetch(interaction.options.getUser("user"))
                const saves = interaction.options.getNumber("saves")
                const db = interaction.client.db.Counters

                let [userSaves,] = await db.findOrCreate({ where: { userID: user.id } });
                const slots = interaction.options.getInteger("slots") || userSaves.slots
                if (saves > slots) return interaction.reply({ content: "❌ **You cannot set saves higher than slots!**", ephemeral: true })

                await userSaves.update({ saves: saves * 10, slots: slots })
                console.log(`${formattedName(interaction.user)} changed saves for ${formattedName(user)} to ${saves}/${slots}`)
                return interaction.reply(`✅ **Changed saves for ${formattedName(user)} to ${saves}/${slots}.**`)
            }
            case "sethighscore": {
                const highscore = interaction.options.getInteger("highscore")
                const db = interaction.client.db.Data
                const guildDB = await db.findOne({ where: { guildID: interaction.guild.id } })

                await guildDB.update({ highscore: highscore })
                console.log(`${formattedName(interaction.user)} changed the highscore to ${highscore}`)
                return interaction.reply(`✅ **Changed the highscore to ${highscore}.**`)
            }
            case "setguildsaves": {
                const db = interaction.client.db.Data
                const saves = interaction.options.getNumber("saves")
                const guildDB = await db.findOne({ where: { guildID: interaction.guild.id } })

                await guildDB.update({ guildSaves: saves })
                console.log(`${formattedName(interaction.user)} changed the guild's saves to ${saves}`)
                return interaction.reply(`✅ **Changed the guild's saves to ${saves}.**`)
            }
            case "resetclaimcooldown": {
                const db = interaction.client.db.Counters
                const user = interaction.options.getUser("user")
                const [userDB,] = await db.findOrCreate({ where: { userID: user.id } })

                await userDB.update({ saveCooldown: 0 })
                console.log(`${formattedName(interaction.user)} reset save claim cooldown for ${formattedName(user)}`)
                return interaction.reply(`✅ **Reset save claim cooldown for ${formattedName(user)}.**`)
            }
        }
    }
}