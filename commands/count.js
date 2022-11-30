const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('count')
        .setDescription(`Get the current count`),
    async execute(interaction) {

        const guildDB = await interaction.client.db.Data.findOne({ where: { guildID: interaction.guild.id }});
        let numb = await interaction.client.db.Data.findOne()
        let lastCounter;
        try {
            lastCounter = await interaction.client.users.fetch(guildDB.lastCounterID)
        } catch(e) {
            lastCounter = "[ no one ]"
        }
        return interaction.reply({ content: `The current number is **${numb.count}** and was last counted by ${lastCounter}.`, ephemeral: true });
    },
};