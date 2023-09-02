/*
    This file contains some functions that are re-sued by other files in the bot.
*/

const { useMath } = require("./config.json")

function validateExpression(number) {
    if (useMath) {
        return /^[+\-/*^0-9().]+$/.test(number)
    } else {
        return /^[0-9().]+$/.test(number)
    }
}

function random_range(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function random(number) {
    return Math.floor(Math.random() * number)
}

function isNumber(message) {
    return validateExpression(message.content.split(" ")[0]) && message.attachments.size == 0 && message.stickers.size == 0 && message.content.toUpperCase() !== "INFINITY"
}

function formattedName(user) {
    return user.discriminator === "0" ? `${user.username}` : user.tag
}

module.exports = { validateExpression, random_range, random, isNumber, formattedName }