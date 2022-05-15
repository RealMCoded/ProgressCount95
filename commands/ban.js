const fs = require('node:fs')
const { SlashCommandBuilder } = require('@discordjs/builders');
const {MessageEmbed} = require('discord.js');
const banMBRfile = './data/banned.json'
const banMBR = require("." + banMBRfile);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban-count-toggle')
        .setDescription(`Ban a user from counting. Run again to unban.`)
        .addUserOption(option => option.setName('user').setDescription('the user').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('the reason for the ban. Unused for unbans.').setRequired(true)),
    async execute(interaction) {
        let mbr = interaction.options.getUser("user")
        if (mbr == "511223071504334866") {
            interaction.reply("You can't ban Chris from counting!")
            return
        } else {
            if (banMBR.includes(mbr.id)) {
                banMBR.splice(banMBR.indexOf(mbr.id), 1)
                interaction.reply("User unbanned!")
                fs.writeFile(banMBRfile, JSON.stringify(banMBR, null, 2), function writeJSON(err) {
                    if (err) return console.error(err);
                });
            } else {
            banMBR.push(mbr.id)
            
            fs.writeFile(banMBRfile, JSON.stringify(banMBR, null, 2), function writeJSON(err) {
                if (err) return console.error(err);
            });

            console.log(`${interaction.user.tag} banned ${mbr}`)
        return interaction.reply({ content: `✅ **Banned ${mbr} from counting for "${interaction.options.getString("reason")}"**`, ephemeral: false }); 
        }
        }
    },
};