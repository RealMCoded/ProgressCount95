/*
    This file contains some functions that are re-sued by other files in the bot.
*/

module.exports = {
	validateExpression(number) {
		return /^[+\-/*^0-9().]+$/.test(number)
	},

	random_range(min, max) {
        return Math.floor(Math.random() * (max - min + 1) ) + min;
    },

    random(number) {
        return Math.floor(Math.random() * number)
    }
}