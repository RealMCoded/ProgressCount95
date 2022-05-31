const fs = require('node:fs')

/*
fs.writeFileSync('./data/numb.txt', '0', (err) => {
    if (err) throw err;
});


fs.writeFileSync('./data/banned.json', '[]', (err) => {
    if (err) throw err;
});*/

fs.copyFile('config.json.template', 'config.json', (err) => {
    if (err) throw err;
});

console.log("Created first run files.")
process.exit(1)