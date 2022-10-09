const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('procounting-eligibility')
        .setDescription(`procounting-eligibility`),
    async execute(interaction) {
        //initial variable definition
        const db = interaction.client.db.Counters;

        let [row,] = await db.findOrCreate({ where: { userID: interaction.user.id }})
        let hasScoreRequirement = "❌"
        let hasAccuracyRequirement = "❌"
        let finalMessage = "❌ Ultra rare error!"
        let color = "#FF0000"
        let numbers = row.get("numbers")

        //do epic checks
        if (numbers > 499) hasScoreRequirement = "✅"

        let accuracy = (row.get("numbers") / (row.get("numbers") + row.get("wrongNumbers")) * 100).toFixed(3)

        if (accuracy > 97.999) hasAccuracyRequirement = "✅"

        //make the final judgement
        if (hasScoreRequirement == "✅" && hasAccuracyRequirement == "✅") {color = "#00FF00"; finalMessage = "✅ You might be eligible to get access to <#990334350065291334>! Contact one of the mods to get access."} else {finalMessage = "❌ You are not eligible to get access to <#990334350065291334> yet. Try again later."}

        let embed = new MessageEmbed()
                    .setTitle("#🏆pro-counting eligibility")
                    .setColor(color)
                    .setTimestamp()
                    .setDescription(`**At least 500 score:** ${hasScoreRequirement} (You have ${numbers})\n**At least 98% accuracy:** ${hasAccuracyRequirement} (You have ${accuracy}%)\n**At least one <@510016054391734273> save:** ⚠️ (Unable to check)\n\n**${finalMessage}**\n\n*ℹ️ this command only checks your ProgressCount95 stats, if you meet all these requirements on <@510016054391734273>, you could be eligible!*`)
        return interaction.reply({embeds: [embed]});
    },
};