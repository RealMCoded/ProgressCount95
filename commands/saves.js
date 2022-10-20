const { SlashCommandBuilder } = require('@discordjs/builders');
const {MessageEmbed, Permissions} = require('discord.js');
const { userSavesPerGuildSave, guildSaveSlots, saveClaimCooldown, savesPerClaim, clientId, transferTax } = require('../config.json')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('saves')
        .setDescription(`save cmd`)
        .addSubcommand(subcommand => subcommand
			.setName("claim")
			.setDescription("Claim your saves!"))
        .addSubcommand(subcommand => subcommand
			.setName("view")
			.setDescription("View your saves!"))
        .addSubcommand(subcommand => subcommand
            .setName("donate")
            .setDescription(`Donate saves to the server! (${userSavesPerGuildSave} per guild save)`))
        .addSubcommand(subcommand => subcommand
            .setName("transfer")
            .setDescription("Transfer saves to other users")
            .addUserOption(option => option
                .setName("user")
                .setDescription("the user")
                .setRequired(true))),
    async execute(interaction) {
        const db = interaction.client.db.Counters;
        const subcommand = interaction.options.getSubcommand();
        let [author,] = await db.findOrCreate({ where: { userID: interaction.user.id } });
        if (author.banned) {
            return interaction.reply({ content: `❌ Sorry, you can't use this command because you're currently banned from using ProgressCount95. Bans are usually issued for trolling or ruining counts on purpose.\n\n**Reason for the ban:** "${author.banReason}"`, ephemeral: true })
        }
        if (subcommand === "claim") {
            //let delay = 43200 //10 seconds for testing
            let [row,] = await db.findOrCreate({ where: { userID: interaction.user.id }})
            const lastBeg= parseInt(row.get('saveCooldown'))
            const n = Math.floor(Date.now() / 1000)

            if(n <= lastBeg+saveClaimCooldown){
                let embed = new MessageEmbed()
                    .setTitle("Saves")
                    .setColor("#FF9900")
                    .setTimestamp()
                    .setDescription(`You've already claimed recently! Try again <t:${lastBeg+saveClaimCooldown}:R> (<t:${lastBeg+saveClaimCooldown}:f>)`)
                return interaction.reply({embeds: [embed]});
            } else {
                if (row.get('saves')/10 >= row.get('slots')) {
                    let embed = new MessageEmbed()
                        .setTitle("Saves")
                        .setColor("#FF9900")
                        .setDescription(`Your save slots are full! (${row.get('saves')/10}/${row.get('slots')})`)
                    return interaction.reply({embeds: [embed]})
                }
                if ((row.get('saves')+savesPerClaim)> row.get('slots')*10) {
                    let partialSave = (row.slots*10-row.get("saves"))
                    row.update({ saves: (row.saves+partialSave)})
                    let embed = new MessageEmbed()
                        .setTitle("Saves")
                        .setColor("#0099ff")
                        .setTimestamp()
                        .setDescription(`You have claimed **${partialSave/10}** saves!\nYou now have **${row.get('saves')/10}/${row.get('slots')}** saves!`)
                    return interaction.reply({embeds: [embed]})
                }
                row.increment('saves', { by: savesPerClaim });
                row.update({ saveCooldown: n });

                let embed = new MessageEmbed()
                    .setTitle("Saves")
                    .setColor("#0099ff")
                    .setTimestamp()
                    .setDescription(`You have claimed **${savesPerClaim/10}** saves!\nYou now have **${(row.get('saves')+savesPerClaim)/10}/${row.get('slots')}** saves!`)
                return interaction.reply({embeds: [embed]});
            }

        } else if (subcommand === "view") {
            const row = await db.findOne({ where: { userID: interaction.user.id }})
            if (row) {
                const embed = new MessageEmbed()
                    .setTitle(`Saves`)
                    .setColor("#0099ff")
                    .setDescription(`You have **${row.get('saves')/10}/${row.get('slots')}** saves`)
                    .setTimestamp()
                return interaction.reply({embeds: [embed]});
            } else {
                const embed = new MessageEmbed()
                    .setTitle(`Saves`)
                    .setColor("#0099ff")
                    .setDescription(`**You have not claimed any saves! Use \`/saves claim\`!**`)
                    .setTimestamp()
                return interaction.reply({embeds: [embed]});
            }
        } else if (subcommand === "donate") {
            let guildDB = await interaction.client.db.Data.findOne({ where: { guildID: interaction.guild.id } })
            let [userDB,] = await interaction.client.db.Counters.findOrCreate({ where: { userID: interaction.user.id } })
            if (guildDB.guildSaves == guildSaveSlots) {
                const replyEmbed = new MessageEmbed()
                    .setTitle("Save Donation")
                    .setColor("#FF0000")
                    .setDescription(`The server is already at the maximum saves! (${guildSaveSlots})`)
                    .setTimestamp()
                return interaction.reply({ embeds: [replyEmbed], ephemeral: true })
            } else if (userDB.saves/10 < 1) {
                const replyEmbed = new MessageEmbed()
                    .setTitle("Save Donation")
                    .setColor("#FF0000")
                    .setDescription(`You need at least 1 save to donate, but you have ${userDB.saves/10}!)`)
                    .setTimestamp()
                return interaction.reply({ embeds: [replyEmbed], ephemeral: true })
            } else {
                const saveRatio = 1 / userSavesPerGuildSave
                const ten = 10
                await userDB.decrement('saves', {by: ten})
                await guildDB.increment("guildSaves", { by: saveRatio })
                guildDB = await interaction.client.db.Data.findOne({ where: { guildID: interaction.guild.id } })
                userDB = await interaction.client.db.Counters.findOne({ where: { userID: interaction.user.id } })
                const replyEmbed = new MessageEmbed()
                    .setTitle("Save Donation")
                    .setColor("#00FF00")
                    .setDescription(`You have donated **1** of your saves to the server, for a total of **${guildDB.guildSaves}/${guildSaveSlots}** server saves. You now have **${userDB.saves/10}** saves.`)
                return interaction.reply({ embeds: [replyEmbed]})
            }
        } else if (subcommand === 'transfer') {
            const userA = interaction.user
            const userB = await interaction.client.users.fetch(interaction.options.getUser("user"))
            let [userDBA,] = await interaction.client.db.Counters.findOrCreate({ where: { userID: userA.id}})
            let [userDBB,] = await interaction.client.db.Counters.findOrCreate({ where: { userID: userB.id}})
            let taxMessage = ""
            if (transferTax) taxMessage = ` (+${transferTax/10} tax)`
            if (userA == userB) {
            const replyEmbed = new MessageEmbed()
                .setTitle("Saves")
                .setColor("#FF0000")
                .setDescription(`❌ **You can't transfer saves to yourself!**`)
                .setTimestamp()
            return interaction.reply({ embeds: [replyEmbed], ephemeral: true })
            } else if (userB.id == clientId){
                const replyEmbed = new MessageEmbed()
                .setTitle("Saves")
                .setColor("#FF0000")
                .setDescription(`❌ **You can't transfer saves to me!**`)
                .setTimestamp()
            return interaction.reply({ embeds: [replyEmbed], ephemeral: true })
            } else if (userDBB.banned) {
                const replyEmbed = new MessageEmbed()
                    .setTitle("Saves")
                    .setColor("#FF0000")
                    .setDescription(`❌ **You cannot transfer saves to a banned user!**`)
                    .setTimestamp()
                return interaction.reply({ embeds: [replyEmbed], ephemeral: true })
            } else if (userDBB.saves/10 == userDBB.slots) {
                const replyEmbed = new MessageEmbed()
                    .setTitle("Saves")
                    .setColor("#FFFF00")
                    .setDescription(`**${userB.tag}** already has maximum saves! (${userDBB.saves/10})`)
                    .setTimestamp()
                return interaction.reply({ embeds: [replyEmbed], ephemeral: true })
            } else if (userDBA.saves < 10+transferTax) {
                const replyEmbed = new MessageEmbed()
                    .setTitle("Saves")
                    .setColor("#FF0000")
                    .setDescription(`You don't have enough saves to transfer! (${userDBA.saves/10}/${userDBA.slots})`)
                    .setTimestamp()
                return interaction.reply({ embeds: [replyEmbed], ephemeral: true })
            } else if (userDBB.slots - userDBB.saves/10 < 1) {
                let partialSave = (userDBB.slots*10 - userDBB.saves)
                await userDBA.decrement("saves", { by: (partialSave)+transferTax })
                await userDBB.increment("saves", { by: partialSave})
                userDBA = await interaction.client.db.Counters.findOne({ where: { userID: userA.id }})
                userDBB = await interaction.client.db.Counters.findOne({ where: { userID: userB.id }})
                const replyEmbed = new MessageEmbed()
                    .setTitle("Saves")
                    .setColor("#00FF00")
                    .setDescription(`You have transferred **${partialSave/10}**${taxMessage} of your saves to **${userB.tag}**. You now have **${userDBA.saves/10}** saves.`)
                return interaction.reply({ embeds: [replyEmbed]})    
            
            } else {
                await userDBA.decrement("saves", { by: 10+transferTax })
                await userDBB.increment("saves", { by: 10 })
                userDBA = await interaction.client.db.Counters.findOne({ where: { userID: userA.id }})
                userDBB = await interaction.client.db.Counters.findOne({ where: { userID: userB.id }})
                const replyEmbed = new MessageEmbed()
                    .setTitle("Saves")
                    .setColor("#00FF00")
                    .setDescription(`You have transferred **1**${taxMessage} of your saves to **${userB.tag}**.$You now have **${userDBA.saves/10}** saves.`)
                return interaction.reply({ embeds: [replyEmbed]})
            }
        }        
    },
};
