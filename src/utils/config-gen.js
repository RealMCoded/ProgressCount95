const fs = require('node:fs')

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('close', () => {
  console.log("\nConfig.json created!")
  process.exit(0);
});

console.log("\nProgressCount95 First run config.json creator\n")

if (fs.existsSync('config.json')) {
  console.log("!!! config.json already exists. Please deconste it and try again. !!!\n")
  process.exit(1)
}

async function questions() {
  const clientId = await new Promise(r => rl.question('Enter your bot\'s ClientID: ', r))
  const guildId = await new Promise(r => rl.question('Enter the ID of the server you will use the bot in: ', r))
  const countingCh = await new Promise(r => rl.question('Enter the ID of the Counting Channel: ', r))
  const token = await new Promise(r => rl.question('Enter your bot token: ', r))
  const SQL_USER = await new Promise(r => rl.question('Enter your SQL Username: ', r))
  const SQL_PASS = await new Promise(r => rl.question('Enter your SQL Password: ', r))
  const guildSaveSlots = await new Promise(r => rl.question('How many guild save slots? (default: 2): ', r))
  const userSaveSlots = await new Promise(r => rl.question('How many user saves per guild saves? (default: 4): ', r))
  const defaultSlots = await new Promise(r => rl.question('How many default save slots? (default: 5): ', r))
  const initialSaves = await new Promise(r => rl.question('How many saves should the user start with? (default: 2): ', r))
  const savesPerClaim = await new Promise(r => rl.question('How many saves should the user claim with /saves claim (default: 0.5): ', r))
  const numbersRequiredForFreeSave = await new Promise(r => rl.question('How many numbers are required for a free save (default: 50): ', r));
  const freeSave = await new Promise(r => rl.question('How many free saves should be given after that number? (default: 0.1): ', r))

  fs.writeFile('config.json', JSON.stringify({
    "token": token,
    "clientId": clientId,
    "guildId": guildId,
    "countingCh": countingCh,
    "useCustomEmoji": false, //force this to false
    "SQL_USER": SQL_USER,
    "SQL_PASS": SQL_PASS,
    "guildSaveSlots": parseInt(guildSaveSlots),
    "userSavesPerGuildSave": parseInt(userSaveSlots),
    "saveClaimCooldown": 43200,
    "defaultSlots": parseInt(defaultSlots),
    "initialSaves": parseInt(initialSaves),
    "savesPerClaim": parseFloat(savesPerClaim),
    "numbersRequiredForFreeSave": parseInt(numbersRequiredForFreeSave),
    "freeSave": parseInt(freeSave)
  }));
}

questions().then(e => rl.close());