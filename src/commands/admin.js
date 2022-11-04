const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageEmbed } = require('discord.js');
const { adminCommandPermission, countingCh } = require("../config.json")
const logger = require("../utils/logger.js")

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
                .setDescription("The user")
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
                .setDescription("The user")
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
                .setDescription("The user")
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
                .setDescription("The user")
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
            .setDescription("Reset an user's save claim cooldown")
            .addUserOption(option => option
                .setName("user")
                .setDescription("The user")
                .setRequired(true))),
    async execute(interaction) {
        if (!interaction.member.permissions.has(Permissions.FLAGS[adminCommandPermission])) return interaction.reply({ content: `❌ **You must have the \`${adminCommandPermission}\` permission to run this command!**`, ephemeral: true });

        switch(interaction.options.getSubcommand()){
            case "setban":
                const setbanMbr = await interaction.client.users.fetch(interaction.options.getUser("user"))
                if (mbr.id ==  interaction.client.user.id) return interaction.reply("❌ **What did I ever do to you?**")

                const ban = interaction.options.getBoolean("ban")
                const setbanReason = interaction.options.getString("reason")

                const setbanRow = await interaction.client.db.Counters.findOrCreate({ where: { userID: setbanMbr.id } })
                await setbanRow.row.update(ban ? { banReason: setbanReason, banned: true } : { banReason: null, banned: false })

                interaction.reply(ban ? `✅ **Banned ${setbanMbr.username}#${setbanMbr.discriminator} from counting for "${interaction.options.getString("reason")}".**` : `✅ **Unbanned ${setbanMbr.username}#${setbanMbr.discriminator} from counting.**`)
                logger.log(ban ? `${interaction.user.tag} has banned ${setbanMbr.username}#${setbanMbr.discriminator} from counting for "${interaction.options.getString("reason")}".`  : `${interaction.user.tag} has unbanned ${setbanMbr.username}#${setbanMbr.discriminator} from counting.`);
            break;
            case "updateban":
                const updatebanMbr = await interaction.client.users.fetch(interaction.options.getUser("user"))
                if (updatebanMbr.id == interaction.client.user.id) return interaction.reply("❌ **What did I ever do to you?**")

                const updatebanRow = await interaction.client.db.Counters.findOne({ where: { userID: updatebanMbr.id } })
                if (!updatebanRow) return interaction.reply({ content: `❌ **This person is not banned from counting!**`, ephemeral: true });
                                
                const updatebanReason = interaction.options.getString("reason")
                await updatebanRow.update({ banReason: updatebanReason })

                interaction.reply(`✅ **Updated ban reason for ${updatebanMbr.username}#${updatebanMbr.discriminator} to "${interaction.options.getString("reason")}".**`)
                logger.log(`${interaction.user.tag} has updated the ban reason for ${updatebanMbr.username}#${updatebanMbr.discriminator} to "${interaction.options.getString("reason")}".`);
            break;
            case "updateban":
                const mbr = await interaction.client.users.fetch(interaction.options.getUser("user"))
                if (mbr.id == interaction.client.user.id) return interaction.reply("❌ **What did I ever do to you?**")

                const row = await interaction.client.db.Counters.findOne({ where: { userID: mbr.id } })
                if (!row) return interaction.reply({ content: `❌ **This person is not banned from counting!**`, ephemeral: true });

                const reason = interaction.options.getString("reason")
                await row.update({ banReason: reason })

                interaction.reply(`✅ **Updated ban reason for ${mbr.username}#${mbr.discriminator} to "${interaction.options.getString("reason")}".**`)
                logger.log(`${interaction.user.tag} has updated the ban reason for ${mbr.username}#${mbr.discriminator} to "${interaction.options.getString("reason")}".`);
            break;
            case "banlist":
                let banlist = '';

                const bans = await interaction.client.db.Counters.findAll({ where: { banned: true }});
                const bansOutput = bans.map(bannedUser => {
                    const user = interaction.guild.members.cache.get(bannedUser.userID)
                    return user ? `**${user.username}#${user.discriminator}** - ${bans[i].banReason}` : `**<@${bans[i].userID}>**  - ${bans[i].banReason}\n`
                })
   
                const embed = new MessageEmbed()
                    .setTitle('List of banned members from counting')
                    .setDescription(bans.length == 0 ? '**No one is banned from counting (yet).**' : bansOutput.join("\n"))
                    .setColor('#ff0000')
                interaction.reply({embeds: [embed], ephemeral: true});
            break;
            case "setcount":
                const numb = interaction.options.getInteger("count")

                const numbdb = await interaction.client.db.Data.findOne()
                numbdb.update({ count: numb.toString() })
    
                logger.log(`${interaction.user.tag} changed the number to ${numb}`)
                await interaction.client.channels.cache.get(countingCh).send(`⚠️ The count was changed to **${numb}**! The next number is **${numb+1}**`)
                interaction.reply({ content: `✅ **Set the count to ${numb}!**`, ephemeral: false });
            break;
            case "setuserscore":
                const correctNumbers = interaction.options.getInteger("correct")
                const incorrectNumbers = interaction.options.getInteger("incorrect")

                const setuserscoreUser = await interaction.client.users.fetch(interaction.options.getUser("user"))

                const setuserscoreRow = await interaction.client.db.Counters.findOrCreate({ where: { userID: setuserscoreUser.id } })
                setuserscoreRow.row.update({ wrongNumbers: incorrectNumbers, numbers: correctNumbers })

                logger.log(`${interaction.user.tag} changed the score for ${setuserscoreUser.tag} to ${correctNumbers} correct, ${incorrectNumbers} incorrect`)
                interaction.reply({ content: `✅ **Changed the score for ${setuserscoreUser.tag} to ${correctNumbers} correct, ${incorrectNumbers} incorrect.**`, ephemeral: true })
            break;
            case "setusersaves":
                const saves = interaction.options.getNumber("saves")
                const slots = interaction.options.getInteger("slots") || userSaves.slots

                const user = await interaction.client.users.fetch(interaction.options.getUser("user"))

                const [userSaves,] = await interaction.client.db.Counters.findOrCreate({ where: { userID: user.id } });
                if (saves > slots) { return interaction.reply({ content: "❌ **You cannot set saves higher than slots!**", ephemeral: true })}

                userSaves.update({ saves: saves*10, slots: slots })

                logger.log(`${interaction.user.tag} changed saves for ${user.tag} to ${saves}/${slots}`)
                interaction.reply(`✅ **Changed saves for ${user.tag} to ${saves}/${slots}.**`)
            break;
            case "sethighscore":
                const highscore = interaction.options.getInteger("highscore")

                const guildDB = await interaction.client.db.Data.findOne({ where: { guildID: interaction.guild.id } })
                await guildDB.update({ highscore: highscore })

                logger.log(`${interaction.user.tag} changed the highscore to ${highscore}`)
                interaction.reply(`✅ **Changed the highscore to ${highscore}.**`)
            break;
            case "setguildsaves":
                const setguildsavesSaves = interaction.options.getNumber("saves")

                const setguildsavesGuildDB = await interaction.client.db.Data.findOne({ where: { guildID: interaction.guild.id } })
                await setguildsavesGuildDB.update({ guildSaves: setguildsavesSaves })

                logger.log(`${interaction.user.tag} changed the guild's saves to ${setguildsavesSaves}`)
            break;
            case "resetclaimcooldown":
                const resetclaimcooldownUser = interaction.options.getUser("user")

                const [userDB,] = await interaction.client.db.Counters.findOrCreate({ where: { userID: resetclaimcooldownUser.id }})
                await userDB.update({ saveCooldown: 0 })

                logger.log(`${interaction.user.tag} reset save claim cooldown for ${resetclaimcooldownUser.tag}`)
                interaction.reply(`✅ **Reset save claim cooldown for ${resetclaimcooldownUser.tag}.**`)
            break;
        }
    }
}