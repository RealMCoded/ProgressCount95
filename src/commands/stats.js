const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { guildSaveSlots } = require('../config.json')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription(`View stats!`)
        .addSubcommand(subcommand =>
            subcommand
                .setName("server")
                .setDescription("View the servers counting stats"))
        .addSubcommand(subcommand =>
            subcommand
                .setName("user")
                .setDescription("View a user's counting stats")
                .addUserOption(option => option.setName('user').setDescription('The user to view the stats of').setRequired(false))),
    async execute(interaction) {
        const db = interaction.client.db;

        switch (interaction.options.getSubcommand()) {
            case "server":
                var tot = 0
                const guildDB = await db.Data.findOne({ where: { guildID: interaction.guild.id } });
                list = await db.Counters.findAll({
                    attributes: ['numbers']
                })

                for (var i = 0; i < list.length; i++) {
                    tot = tot + list[i].numbers
                }
                let lastCounter;
                if (guildDB.lastCounterID != 0) {
                    lastCounter = await interaction.client.users.fetch(guildDB.lastCounterID)
                } else {
                    lastCounter = "(no one)"
                }
                const serverEmbed = new MessageEmbed()
                    .setTitle(`Server Stats`)
                    .setColor("#0099ff")
                    .setDescription(`**Current number:** ${guildDB.count}\n**Last counter:** ${lastCounter}\n**Guild saves:** ${guildDB.guildSaves}/${guildSaveSlots}\n**Highscore:** ${guildDB.highscore}\n\n**Total numbers counted:** ${tot}`)
                    .setTimestamp()

                interaction.reply({ embeds: [serverEmbed] });
                break;
            case "user":
                const usr = interaction.options.getUser("user") || interaction.member.user;
                if (usr.bot) return interaction.reply({ content: "❌ **Bots don't have counting stats!**", ephemeral: true })

                const tag = await db.Counters.findOne({ where: { userID: usr.id } });
                if (!tag) {
                    const tagEmbed = new MessageEmbed()
                        .setTitle(`Stats for ${person.tag}`)
                        .setColor("#0099ff")
                        .setDescription(`***${person.tag} does not have any counting stats yet!***`)
                        .setTimestamp()
                    return interaction.reply({ embeds: [tagEmbed] });
                }

                const rawList = await db.Counters.findAll({
                    attributes: ['numbers', 'userID']
                })
                const sortedList = rawList.sort((a, b) => b.numbers - a.numbers)
                const lbpos = sortedList.findIndex((user) => user.userID === usr.id) + 1

                const correct = tag.get("numbers")
                const incorrect = tag.get("wrongNumbers")
                const saves = tag.get("saves")
                const slots = tag.get("slots")
                const accuracy = (correct / (correct + incorrect) * 100).toFixed(3)
                const person = await interaction.client.users.fetch(usr.id)

                const activeDate = new Date(tag.get("updatedAt")).valueOf().toString().slice(0, -3)
                const createdAt = new Date(tag.get("createdAt")).valueOf().toString().slice(0, -3)

                const embed = new MessageEmbed()
                    .setTitle(`Stats for ${person.tag}`)
                    .setColor("#0099ff")
                    .setDescription(`**Leaderboard Position:** #${lbpos}\n**Accuracy:** ${accuracy}%\n**Correct numbers:** ${correct}\n**Wrong numbers:** ${incorrect}\n**Score:** ${correct - incorrect}\n**Saves:** ${saves / 10}/${slots}\n**Last Active:** <t:${activeDate}:f> (<t:${activeDate}:R>)\n**Started counting:** <t:${createdAt}:f> (<t:${createdAt}:R>)`)
                    .setTimestamp()
                interaction.reply({ embeds: [embed] });
                break;
        }
    }
};
