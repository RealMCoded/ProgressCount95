const { SlashCommandBuilder } = require('@discordjs/builders');
const {MessageEmbed} = require('discord.js');
const { guildSaveSlots } = require('../config.json')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription(`Viewstats!`)
        .addSubcommand(subcommand =>
			subcommand
			.setName("server")
			.setDescription("View server stats"))
        .addSubcommand(subcommand =>
            subcommand
            .setName("user")
            .setDescription("View a user's stats")
            .addUserOption(option => option.setName('user').setDescription('the chosen one').setRequired(false))),
    async execute(interaction) {
        const db = interaction.client.db;
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "server") {
            
            var tot = 0
            const guildDB = await db.Data.findOne({ where: { guildID: interaction.guild.id }});
            list = await db.Counters.findAll({
                attributes: ['numbers']
            })

            for(var i=0; i < list.length; i++){
                tot = tot + list[i].numbers
            }
            let lastCounter;
            if(guildDB.lastCounterID != 0) {
                lastCounter = await interaction.client.users.fetch(guildDB.lastCounterID)
            } else {
                lastCounter = "(no one)"
            }
            const embed = new MessageEmbed()
                .setTitle(`Server Stats`)
                .setColor("#0099ff")
                .setDescription(`**Current number:** ${guildDB.count}\n**Last counter:** ${lastCounter}\n**Guild saves:** ${guildDB.guildSaves}/${guildSaveSlots}\n**Highscore:** ${guildDB.highscore}\n\n**Total numbers counted:** ${tot}`)
                .setTimestamp()

		    return interaction.reply({embeds: [embed]});

        } else if (subcommand === "user") {
            const usr = interaction.options.getUser("user") || interaction.member.user;

            if (usr.bot) return interaction.reply({content:"❌ **Bots don't have counting stats!**", ephemeral: true})

            const tag = await db.Counters.findOne({ where: { userID: usr.id } });
              
            if (tag) {
                var list = await db.Counters.findAll({
                    attributes: ['numbers', 'userID']
                })
    
                list = list.sort((a, b) => b.numbers - a.numbers)

                let lbpos = 0

                for(var i=0; i < list.length; i++){
                    if (list[i].userID == usr.id) {lbpos = i+1; break;}  
                }

                const correct = tag.get("numbers")
                const incorrect = tag.get("wrongNumbers")
                const saves = tag.get("saves")
                const slots = tag.get("slots")
                const accuracy = (correct / (correct + incorrect) * 100).toFixed(3)
                const person = await interaction.client.users.fetch(usr.id)
                const embed = new MessageEmbed()
                    .setTitle(`Stats for ${person.tag}`)
                    .setColor("#0099ff")
                    .setDescription(`**Leaderboard Position:** #${lbpos}\n**Accuracy:** ${accuracy}%\n**Correct numbers:** ${correct}\n**Wrong numbers:** ${incorrect}\n**Saves:** ${saves/10}/${slots}`)
                    .setTimestamp()
                return interaction.reply({embeds: [embed]});
            } else {
                const embed = new MessageEmbed()
                    .setTitle(`Stats for ${person.tag}`)
                    .setColor("#0099ff")
                    .setDescription(`***${person.tag} does not have any stats yet!***`)
                    .setTimestamp()
                return interaction.reply({embeds: [embed]});
            }
        }
    },
};
