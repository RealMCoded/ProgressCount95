const { SlashCommandBuilder } = require('@discordjs/builders');
const {MessageEmbed} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('saves')
        .setDescription(`save cmd`)
        .addSubcommand(subcommand =>
			subcommand
			.setName("claim")
			.setDescription("Claim your saves!"))
        .addSubcommand(subcommand =>
			subcommand
			.setName("view")
			.setDescription("View your saves!"))
        .addSubcommand(subcommand =>
            subcommand
            .setName("99")
            .setDescription("Admin and debug use only! gives you 99 saves")),
    async execute(interaction) {
        const db = interaction.client.db.Saves;
        const subcommand = interaction.options.getSubcommand();
        let save = await db.findOne({ where: { userID: interaction.member.user.id } });
        if (subcommand === "claim") {

            if (save) {
                save.increment('saves', { by: 0.5 });
            } else {
                await db.create({
                    userID: interaction.member.user.id,
                    saves: 0.5
                })
            }
            const embed = new MessageEmbed()
                .setTitle(`Saves`)
                .setColor("#0099ff")
                .setDescription(`You have claimed **0.5** saves!\nYou now have **${save.get('saves')+0.5}** saves!`)
                .setTimestamp()
            return interaction.reply({embeds: [embed]});

        } else if (subcommand === "view") {
            if (save) {
                const embed = new MessageEmbed()
                    .setTitle(`Saves`)
                    .setColor("#0099ff")
                    .setDescription(`You have **${save.get('saves')}** saves`)
                    .setTimestamp()
                return interaction.reply({embeds: [embed]});
            } else {
                const embed = new MessageEmbed()
                    .setTitle(`Saves`)
                    .setColor("#0099ff")
                    .setDescription(`**You have not claimed any saves! Use \`/saves claim\`!**`)
                    .setTimestamp()
                return interaction.reply({embeds: [embed]});
            }
        } else if (subcommand === "99") {
            if (interaction.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) { //I'm using MANAGE_ROLES because it's a permission that is only available to all staff members - even helpers. This can be bumped to MANAGE_MEMBERS later.
                db.create({
                    saves: 99,
                    userID: interaction.member.user.id,
                })
                return interaction.reply({ content: "k", ephemeral: true }); //show nothing for now
            } else {
                return interaction.reply({ content: "You do not have permission to use this command", ephemeral: true });
            }
        }
    },
};