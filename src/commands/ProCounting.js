const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('procounting-eligibility')
        .setDescription(`Check if you can get access to the pro-counting channel!`),
    private: true,
    async execute(interaction) {
        const db = interaction.client.db.Counters;

        const [row] = await db.findOrCreate({ where: { userID: interaction.user.id } })
        const numbers = row.get("numbers")
        const wrongNumb = row.get("wrongNumbers")
        const score = numbers - wrongNumb
        const accuracy = (numbers / (numbers + wrongNumb) * 100).toFixed(3)

        const hasScoreRequirement = score > 499 ? "✅" : "❌"
        const hasAccuracyRequirement = accuracy > 97.999 ? "✅" : "❌"

        const finalMessage = score > 499 && accuracy > 97.999 ? "✅ You might be eligible to get access to <#990334350065291334>! Contact one of the mods to get access." : "❌ You are not eligible to get access to <#990334350065291334> yet. Try again later."
        const color = score > 499 && accuracy > 97.999 ? "#00FF00" : "#FF0000"

        const embed = new MessageEmbed()
            .setTitle("#🏆pro-counting eligibility")
            .setColor(color)
            .setTimestamp()
            .setDescription(`**At least 500 score:** ${hasScoreRequirement} (You have ${score}, ${numbers} correct - ${wrongNumb} incorrect)\n**At least 98% accuracy:** ${hasAccuracyRequirement} (You have ${accuracy}%)\n**At least one <@510016054391734273> save:** ⚠️ (Unable to check)\n\n**${finalMessage}**\n\n*ℹ️ this command only checks your ProgressCount95 stats, if you meet all these requirements on <@510016054391734273>, you could be eligible!*`)
        interaction.reply({ embeds: [embed] });
    },
};