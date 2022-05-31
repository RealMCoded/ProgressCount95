const fs = require('node:fs')
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setcount')
        .setDescription(`Change the current number`)
        .addIntegerOption(option => option.setName('numb').setDescription('the number').setRequired(true)),
    async execute(interaction) {
        if (interaction.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) { //I'm using MANAGE_ROLES because it's a permission that is only available to all staff members - even helpers. This can be bumped to MANAGE_MEMBERS later.
            var numb = interaction.options.getInteger("numb")

            var numbdb = await interaction.client.db.Data.findOne({ where: { name: "numb" }})
		    numbdb.update({ value: numb.toString() })

            console.log(`${interaction.user.tag} changed the number to ${numb}`)
            return interaction.reply({ content: `✅ **Set the count to ${numb}!**`, ephemeral: false });
        } else {
            return interaction.reply({ content: `❌ **You cannot do this!**`, ephemeral: true });
        }
    },
};