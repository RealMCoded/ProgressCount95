const { SlashCommandBuilder } = require('@discordjs/builders');
const {MessageEmbed} = require('discord.js');
const { guildSaveSlots } = require('../config.json')
const { formattedName } = require('../Util.js')

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
                .setDescription(`**Current number:** ${guildDB.count}\n**Last counter:** ${lastCounter}\n**Guild saves:** ${guildDB.guildSaves}/${guildSaveSlots}\n**Highscore:** ${guildDB.highscore}\n**Current Streak:** ${guildDB.streak}\n\n**Total numbers counted:** ${tot}`)
                .setTimestamp()

		    return interaction.reply({embeds: [embed]});

        } else if (subcommand === "user") {

            //TODO: Move this to a shared file because of contextmenu_user_stats.js.

            const usr = interaction.options.getUser("user") || interaction.member.user;
            const person = await interaction.client.users.fetch(usr.id)

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

                const activeDate = new Date(tag.get("updatedAt")).valueOf().toString().slice(0, -3)
                const createdAt = new Date(tag.get("createdAt")).valueOf().toString().slice(0, -3)

                const embed = new MessageEmbed()
                    .setTitle(`Stats for ${formattedName(person)}`)
                    .setColor("#0099ff")
                    .setDescription(`**Leaderboard Position:** #${lbpos}\n**Accuracy:** ${accuracy}%\n**Correct numbers:** ${correct}\n**Wrong numbers:** ${incorrect}\n**Score:** ${correct - incorrect}\n**Saves:** ${saves/10}/${slots}\n**Last Active:** <t:${activeDate}:f> (<t:${activeDate}:R>)\n**Started counting:** <t:${createdAt}:f> (<t:${createdAt}:R>)`)
                    .setTimestamp()
                return interaction.reply({embeds: [embed]});
            } else {
                const embed = new MessageEmbed()
                    .setTitle(`Stats for ${formattedName(person)}`)
                    .setColor("#0099ff")
                    .setDescription(`***${formattedName(person)} does not have any counting stats yet!***`)
                    .setTimestamp()
                return interaction.reply({embeds: [embed]});
            }
        }
    },
};
