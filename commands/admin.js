const fs = require('node:fs')
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

module.exports = { 
    data: new SlashCommandBuilder()
        .setName("admin")
        .setDescription("Admin-only commands for the bot.")
        .addSubcommand(subcommand => subcommand
            .setName("setcount")
            .setDescription("Set the current count.")
            .addIntegerOption(option => option
                .setName("count")
                .setDescription("The new count.")
                .setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName("setban")
            .setDescription("Set or unset a ban on a user.")
            .addUserOption(option => option
                .setName("user")
                .setDescription("the user")
                .setRequired(true))
            .addBooleanOption(option => option
                .setName("ban")
                .setDescription("whether to ban or not this user")
                .setRequired(true))
            .addStringOption(option => option
                .setName("reason")
                .setDescription("the reason for the ban. Unused for unbans.")
                .setRequired(true))),
    async execute(interaction) {}

}