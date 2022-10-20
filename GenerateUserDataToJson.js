//const { generateDependencyReport } = require('@discordjs/voice');
const { Sequelize } = require('sequelize');
const fs = require('node:fs')

var data = new Array();

//database shit
const sequelize = new Sequelize('database', "", "", {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
});

const db = require('./modal/database.js')

gen()

async function gen() {
	var list = await db.Counters.findAll({
		attributes: ['numbers', 'userID', 'wrongNumbers']
	})


	list = list.sort((a, b) => b.numbers - a.numbers)

	for(var i=0; i < list.length; i++){
		//console.log(`GOT ${list[i].userID} (${i+1} / ${list.length})`)
		//push the userID and numbers to the data array
		data.push({
			userID: list[i].userID,
			numbers: list[i].numbers,
			wrongNumbers: list[i].wrongNumbers
		})
	}

	fs.writeFileSync('./GeneratedUserData.json', JSON.stringify({ data }));
	console.log('\nDone! Saved file as "GeneratedUserData.json"')
}
