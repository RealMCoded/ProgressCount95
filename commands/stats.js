const { SlashCommandBuilder } = require('@discordjs/builders');
const {MessageEmbed} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription(`Viewstats!`)
        .addSubcommand(subcommand =>
			subcommand
			.setName("server")
			.setDescription("View server stats"))
        .addSubcommand(subcommand =>
            subcommand
            .setName("user")
            .setDescription("View a user's stats")
            .addUserOption(option => option.setName('user').setDescription('the chosen one').setRequired(false))),
    async execute(interaction) {
        const db = interaction.client.db.Counters;
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "server") {
            
            var tot = 0

            list = await db.findAll({
                attributes: ['numbers']
            })

            for(var i=0; i < list.length; i++){
                tot = tot + list[i].numbers
            }

            interaction.reply({ content: `everyone in the server has counted a total of **${tot}** numbers ~~wow what losers~~`, ephemeral: false}); //placeholder

        } else if (subcommand === "user") {
            const usr = interaction.options.getUser("user").id || interaction.user.id;

            const tag = await db.findOne({ where: { userID: usr } });

            if (tag) {
                interaction.reply({ content: `<@${usr}> has counted **${tag.get('numbers')}** numbers`, ephemeral: false});
            } else {
                interaction.reply({ content: `<@${usr}> has not counted any numbers`, ephemeral: false});
            }
        }
    },
};