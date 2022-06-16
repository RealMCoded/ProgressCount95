const fs = require('node:fs')

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("\nProgressCount95 First run config.json creator\n")

if (fs.existsSync('config.json')) {
    console.log("!!! config.json already exists. Please delete it and try again. !!!\n")
    process.exit(1)
}

rl.question('Enter your bot\'s ClientID: ', function (clientId) {
    rl.question('Enter the ID of the server you will use the bot in: ', function (guildId) {
        rl.question('Enter the ID of the Counting Channel: ', function (countingCh) {
            rl.question('Enter your bot token: ', function (token) {
                rl.question('Enter your SQL Username: ', function (SQL_USER) {
                    rl.question('Enter your SQL Password: ', function (SQL_PASS) {
                        rl.question('How many guild save slots? (default: 2): ', function (guildSaveSlots) {
                            rl.question('How many user saves per guild saves? (default: 4): ', function (userSaveSlots) {
                                rl.question('How many default save slots? (default: 5): ', function (defaultSlots) {
                                    rl.question('How many saves should the user start with? (default: 2): ', function (initialSaves) {
                                        rl.question('How many saves should the user claim with /saves claim (default: 0.5): ', function (savesPerClaim) {
                                            fs.writeFileSync('config.json', JSON.stringify({
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
                                                "savesPerClaim": parseFloat(savesPerClaim)
                                            }));
                                            rl.close();
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

rl.on('close', function () {
    console.log("\nConfig.json created!")
    process.exit(0);
});