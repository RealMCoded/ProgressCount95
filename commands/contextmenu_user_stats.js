const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const { ApplicationCommandType } = require('discord-api-types/v9');
const {MessageEmbed} = require('discord.js');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Counting Stats')
        .setType(ApplicationCommandType.User),
    async execute(interaction) {
        const db = interaction.client.db;
        const usr = interaction.targetUser;
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
                .setTitle(`Stats for ${person.tag}`)
                .setColor("#0099ff")
                .setDescription(`**Leaderboard Position:** #${lbpos}\n**Accuracy:** ${accuracy}%\n**Correct numbers:** ${correct}\n**Wrong numbers:** ${incorrect}\n**Score:** ${correct - incorrect}\n**Saves:** ${saves/10}/${slots}\n**Last Active:** <t:${activeDate}:f> (<t:${activeDate}:R>)\n**Started counting:** <t:${createdAt}:f> (<t:${createdAt}:R>)`)
                .setTimestamp()
            return interaction.reply({embeds: [embed]});
        } else {
            const embed = new MessageEmbed()
                .setTitle(`Stats for ${person.tag}`)
                .setColor("#0099ff")
                .setDescription(`***${person.tag} does not have any counting stats yet!***`)
                .setTimestamp()
            return interaction.reply({embeds: [embed]});
        }
    },
};
