/*
    This file contains some functions that are re-sued by other files in the bot.
*/

function validateExpression(number) {
    return /^[+\-/*^0-9().]+$/.test(number)
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

module.exports = { validateExpression, random_range, random, isNumber }