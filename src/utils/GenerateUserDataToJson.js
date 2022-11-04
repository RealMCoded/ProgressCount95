const fs = require('node:fs')
const db = require('../modal/database.js')

(async () => {
	const list = await db.Counters.findAll({
		attributes: ['numbers', 'userID', 'wrongNumbers']
	})

	const sortedList = list.sort((a, b) => b.numbers - a.numbers)

	fs.writeFileSync('./GeneratedUserData.json', JSON.stringify({
		leaderboard: sortedList,
		info:{
			export_date: Date.now()
		}
	}));

	console.log('\nDone! Saved file as "GeneratedUserData.json"')
})()