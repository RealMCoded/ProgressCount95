# ProgressCount95

The counting bot for the [Progressbar95 +Plus server](https://discord.gg/PGMB93T5yJ) created by [stuartt](https://github.com/RealMCoded) (with help from [luihum](https://github.com/luihum) and [5jiji](https://github.com/5jiji))

**[Privacy Policy](https://github.com/RealMCoded/ProgressCount95/blob/master/PRIVACY-POLICY.md)** - **[Trello Board](https://trello.com/b/WMZYOuTd/progresscount95)**

## Known issues

- Sometimes, the bot doesn't update the current number (i still do not know how this happens plz help me fix it).
- If an emoji doesn't exist and the bot tries to use it, the bot crashes. You can turn `useCustomEmoji` to `false` in the `config.json` file if you wish.

## Required Files

The bot requires some files to be made that have been gitignored. The only file it needs to make is `config.json`

This can be done for you by running the following script:
```
node config-gen.js
```

---

Alternatively, you can do it manually:

- Copy `config.json.template`, rename it to `config.json` and replace the variables with your own.

Notes:
* For the `freeSave`, `savesPerClaim`, `initialSaves` and `transferTax` variables, multiply the desired value by 10. (The bot handles saves as integers internally)
* Unicode emoji can be used instead of Discord custom emoji.
* Permission flags can be found [here](https://discord.js.org/#/docs/main/stable/class/Permissions?scrollTo=s-FLAGS).
* The `ruinDelay` value is in miliseconds.
* If you don't want free saves, set the `freeSave` variable to 0.
* The `pushPrivateCommands` variable is specific to the Progressbar95 (+Plus!) server. It should be set to false.

## Building

The bot is built with Node.js.

---

Clone the repository with
```
git clone https://github.com/RealMCoded/ProgressCount95
```
cd into the src directory
```
cd src
```
Install all requirements
```
npm install
```

Start the bot
```
node .
```

Invite your bot with this link (Replace `[ClientID]` with your bot's ID!)
```
https://discord.com/oauth2/authorize?client_id=[ClientID]&permissions=8&scope=bot%20applications.commands
```

For slash commands: Run `REGISTER.bat` to register the slash commands to your server.

You can also run the following command:
```
node src/utils/register.js
```
