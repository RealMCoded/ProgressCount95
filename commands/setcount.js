const fs = require('node:fs')
const { SlashCommandBuilder } = require('@discordjs/builders');
const {MessageEmbed} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setcount')
        .setDescription(`Change the current number`)
        .addIntegerOption(option => option.setName('numb').setDescription('the number').setRequired(true)),
    async execute(interaction) {
        var numb = interaction.options.getInteger("numb")
        fs.writeFile('./data/numb.txt', String(numb), (err) => {
            if (err) throw err;
        });
        console.log(`${interaction.user.tag} changed the number to ${numb}`)
       return interaction.reply({ content: `✅ **Set the count to ${numb}!**`, ephemeral: false }); //show nothing for now
    },
};