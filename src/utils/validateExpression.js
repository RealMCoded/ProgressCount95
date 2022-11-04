module.exports = {
	validateExpression(number) {
		return /^[+\-/*^0-9().]+$/.test(number)
	}
}