const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const { ApplicationCommandType } = require('discord-api-types/v9');
const mathx = require('math-expression-evaluator');
const { validateExpression }= require("../Util.js");

module.exports = { 
    data: new ContextMenuCommandBuilder()
        .setName('Calculate')
        .setType(ApplicationCommandType.Message),
    async execute(interaction) {
        const input = interaction.targetMessage.content.split(" ")[0]

        if(validateExpression(input)) {
            const output = mathx.eval(input)
            interaction.reply({ content: `The result is **${output}**`, ephemeral: true})
        } else {
            interaction.reply({ content: `Invalid expression. Make sure there are no invalid operators or spaces and try again.`, ephemeral: true })
        }
    }
}
