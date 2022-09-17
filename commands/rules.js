const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rules')
        .setDescription(`Read the bot's rules!`),
    async execute(interaction) {
        interaction.reply({content :"**Welcome to ProgressCount95!**\n*please take a moment to read these rules!*\n\n**General Rules**\n- You can't count twice in a row, or you will lose a save.\n- Don't ruin the count on purpose, because you will get banned from counting.\n- Selfbots are prohibited, may result in ban from counting.\n- Your account must be 7 days or older to count.\n- Don't delete your numbers to prevent confusion, please.\n\n**Dot rule**\nIf more than 2 people are counting, please, use dot (.) before sending your number. Dot means you are about to send a number. If there are 2 or more dots, the first one counts.\n*don't send random dots and don't forget the first one comes first.*\n\n**Saves**\nClaim your saves with `/saves claim` every 12 hours. If you don't have saves and you ruin the count, either the guild save will be used, or, if there aren't any, the count will be ruined and reset to 1. You also get 0.1 saves every 50 counted numbers.\n\n**Bugs**\nIf you don't see a checkmark on a number, please, use `/stats server` to check the last number and the counter. The bot is out of Beta, but bugs can happen. If one happens feel free to ping `stuartt#2419`, `Luihum#1287` or `Christian230102#2391`.\n\n**Runs**\nRun is when two members are rapidly counting for a period of time. *DO NOT INTERRUPT RUNS, do NOT send any messages when runs are going, because it might bring confusion.*\n\n*to see these rules again, run `/rules`*", ephemeral: true })
    },
};