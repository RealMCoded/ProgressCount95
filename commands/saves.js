const { SlashCommandBuilder } = require('@discordjs/builders');
const {MessageEmbed, Permissions} = require('discord.js');
const { userSavesPerGuildSave, guildSaveSlots } = require('../config.json')
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
            .setDescription(`Donate saves to the server! (${userSavesPerGuildSave} per guild save)`)),
    async execute(interaction) {
        const db = interaction.client.db.Counters;
        const subcommand = interaction.options.getSubcommand();
        let save = await db.findOne({ where: { userID: interaction.user.id } });
        
        if (subcommand === "claim") {
            let delay = 43200 //10 seconds for testing
            let [row,] = await db.findOrCreate({ where: { userID: interaction.user.id }, defaults: { saves: 2, slots: 5 } })
            const lastBeg= parseInt(row.get('saveCooldown'))
            const n = Math.floor(Date.now() / 1000)

            if(n <= lastBeg+delay){
                let embed = new MessageEmbed()
                    .setTitle("Saves")
                    .setColor("#FF9900")
                    .setTimestamp()
                    .setDescription(`You've already claimed recently! Try again <t:${lastBeg+delay}:R> (<t:${lastBeg+delay}:f>)`)
                return interaction.reply({embeds: [embed]});
            } else {
                
                row.increment('saves', { by: 0.5 });
                row.update({ saveCooldown: n });

                let embed = new MessageEmbed()
                    .setTitle("Saves")
                    .setColor("#0099ff")
                    .setTimestamp()
                    .setDescription(`You have claimed **0.5** saves!\nYou now have **${row.get('saves')+0.5}** saves!`)
                return interaction.reply({embeds: [embed]});
            }

        } else if (subcommand === "view") {
            const row = await db.findOne({ where: { userID: interaction.user.id }})
            if (row) {
                const embed = new MessageEmbed()
                    .setTitle(`Saves`)
                    .setColor("#0099ff")
                    .setDescription(`You have **${row.get('saves')}** saves`)
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
            const guildDB = await interaction.client.db.findOne({ where: { guildID: interaction.guild.id } })
            const [userDB,] = await interaction.client.db.findOrCreate({ where: { userID: interaction.user.id } })
            if (guildDB.guildSaves == guildSaveSlots) {
                const replyEmbed = new MessageEmbed()
                    .setTitle("Save Donation")
                    .setColor("#FF0000")
                    .setDescription(`The server is already at the maximum saves! (${guildSaveSlots})`)
                    .setTimestamp()
                return interaction.reply({ embeds: [replyEmbed], ephemeral: true })
            } else if (userDB.saves < 1) {
                const replyEmbed = new MessageEmbed()
                    .setTitle("Save Donation")
                    .setColor("#FF0000")
                    .setDescription(`You need at least 1 save to donate, but you have ${userDB.saves}!)`)
                    .setTimestamp()
                return interaction.reply({ embeds: [replyEmbed], ephemeral: true })
            } else {
                const saveRatio = 1 / userSavesPerGuildSave
                await userDB.decrement('saves')
                await guildDB.increment("guildSaves", { by: saveRatio })
                const replyEmbed = new MessageEmbed()
                    .setTitle("Save Donation")
                    .setColor("#00FF00")
                    .setDescription(`You have donated **1** of your saves to the server, for a total of **${guildDB.guildSaves}/${guildSaveSlots}** server saves. You now have **${userDB.saves}** saves.`)
                return interaction.reply({ embeds: [replyEmbed]})
            }
        }
    },
};