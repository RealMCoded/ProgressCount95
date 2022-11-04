const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const project = require('../package.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('about')
        .setDescription(`About the bot`),
    async execute(interaction) {
        //todo: check if this works
        try {
            revision = require('child_process')
                .execSync('git rev-parse HEAD')
                .toString().substring(0, 7);
            //const currentTimestamp = Math.round(+new Date() / 1000);
            //const timestampColour = currentTimestamp.toString(16).substring(2, 10);
            const embed = new MessageEmbed()
                .setTitle('ProgressCount95')
                .setDescription(`Version ${project.version} ([commit \`${revision}\`](https://github.com/RealMCoded/ProgressCount95/commit/${revision}))\n\nBot created by stuartt#2419, Assisted by Luihum#1287 and 5jiji#2022`)
                .setColor(`${revision.substring(0,6)}`);
            await interaction.reply({embeds: [embed]});
        } catch(e) {
            const embed = new MessageEmbed()
                .setTitle('ProgressCount95')
                .setDescription(`Version ${project.version} (\`git not installed :(\`)\n\nBot created by stuartt#2419, Assisted by Luihum#1287 and 5jiji#2022`)
                .setColor(`FF0000`);
            await interaction.reply({embeds: [embed]});
        }
    },
};