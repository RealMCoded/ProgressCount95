const { SlashCommandBuilder } = require('@discordjs/builders');
const mathx = require('math-expression-evaluator');
const { validateExpression }= require("../utils/validateExpression.js");

module.exports = { 
    data: new SlashCommandBuilder()
        .setName("calculate")
        .setDescription("Calculate an expression")
        .addStringOption(option => option
            .setName("expression")
            .setDescription("The expression to be calculated. Operators: +, -, *, /, ^ (XOR), ** (exponent), ()")
            .setRequired(true)),
    async execute(interaction) {
        const input = interaction.options.getString("expression")
        if(validateExpression(input)) {
            const output = mathx.eval(input)
            interaction.reply({ content: `The result is **${output}**`, ephemeral: true})
        } else {
            interaction.reply({ content: `Invalid expression. Make sure there are no invalid operators or spaces and try again.`, ephemeral: true })
        }
    }
}
