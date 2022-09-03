const {SlashCommandBuilder} = require('@discordjs/builders');
const { MessageButton, MessageActionRow, MessageEmbed } = require('discord.js');

const time = 30000

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reset-data')
        .setDescription('Reset your ProgressCount95 data.'),
    async execute(interaction) {
        const answerCorrectButton = new MessageButton()
            .setCustomId('yes_delete_my_data')
            .setLabel("Yes, Delete my data.")
            .setStyle('DANGER');
        const answerWrong1Button = new MessageButton()
            .setCustomId('nevermind')
            .setLabel("Nevermind.")
            .setStyle('SUCCESS');

        let answers = [
            answerCorrectButton,
            answerWrong1Button
        ];
        const answerButtons = new MessageActionRow()
            .addComponents(answers);
        const questionEmbed = new MessageEmbed()
            .setTitle("Are you sure you want to reset your ProgressCount95 data?")
            .setDescription("**You are about to reset your ProgressCount95 data.**\n\nThe data that will be reset is: Correct Numbers, Incorrect Numbers. **This does not reset Saves, Saves Slots, Next save claim time, and your banned status from the bot.**\n\nClick on **\"Yes, Delete my data.\"** to delete this data, Click **\"Nevermind.\"** or wait 30 seconds to cancel this.\n\n**THIS IS IRREVERSIBLE. DO THIS AT YOUR OWN RISK!**")
            .setColor('#007f7f')
            //.setFooter(`You have ${time/1000} seconds to answer.`)
        const message = await interaction.reply({embeds: [questionEmbed], components: [answerButtons], fetchReply: true});
        const collector = message.createMessageComponentCollector({ componentType: 'BUTTON', time: time});
        collector.on('collect', async i => {
                if (i.user.id === interaction.user.id) {
                if (i.component.customId === 'yes_delete_my_data') {
                    answerCorrectButton.setDisabled(true);
                    answerWrong1Button.setDisabled(true);
                    let answerButtonFinished = new MessageActionRow().addComponents(answers);
                    i.update({components: [answerButtonFinished]})
                    collector.stop();

                    const db = interaction.client.db.Counters;
                    const [row,] = await db.findOrCreate({ where: { userID: interaction.user.id } })
                    await row.update({ 
                        numbers: 0, 
                        wrongNumbers: 0
                        //saves: 20,
                        //slots: 5,
                        //saveCooldown: 0 
                    })
                    interaction.followUp("✅ **Your data has been cleared.**")
                    //clearUserData()
                } else {
                    answerCorrectButton.setDisabled(true);
                    answerWrong1Button.setDisabled(true);
                    answerButtonFinished = new MessageActionRow().addComponents(answers);
                    i.update({components: [answerButtonFinished]})
                    interaction.followUp("❌ **Canceled - Canceled by user.**")
                    collector.stop();
                }
            } else {
                i.reply({content: '❌ **This is not your prompt.**', ephemeral: true})
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                answerCorrectButton.setDisabled(true);
                answerWrong1Button.setDisabled(true);
                let answerButtonFinished = new MessageActionRow().addComponents(answers);
                interaction.editReply({components: [answerButtonFinished]})
                interaction.followUp("❌ **Canceled - Timeout.**")
            } else {
                return;
            }
        });
    },
};