# ProgressCount95

The counting bot for the [Progressbar95 +Plus server](https://discord.gg/PGMB93T5yJ) created by [stuartt](https://github.com/RealMCoded) (with help from [luihum](https://github.com/luihum) and [5jiji](https://github.com/5jiji))

**[Privacy Policy](https://github.com/RealMCoded/ProgressCount95/blob/master/PRIVACY-POLICY.md)**

## Known issues

- Sometimes, the bot doesn't update the current number (i still do not know how this happens plz help me fix it).
- If an emoji doesn't exist and the bot tries to use it, the bot crashes. You can turn `useCustomEmoji` to `false` in the `config.json` file if you wish.

## Required Files

The bot requires some files to be made that have been gitignored. The only file it needs to make is `config.json`

- Copy `config.template.json`, rename it to `config.json` and replace the variables with your own.

Notes:
* For the `freeSave`, `savesPerClaim`, `initialSaves` and `transferTax` variables, multiply the desired value by 10. (The bot handles saves as integers internally)
* Unicode emoji can be used instead of Discord custom emoji.
* Permission flags can be found [here](https://discord.js.org/#/docs/main/stable/class/Permissions?scrollTo=s-FLAGS).
* The `ruinDelay` value is in miliseconds.
* If you don't want free saves, set the `freeSave` variable to 0.
* The `pushPrivateCommands` variable is specific to the Progressbar95 (+Plus!) server. It should be set to false.

## Running

This bot uses [Node.js](https://nodejs.org/en/) as a backend. It should be installed before continuing.

---

For Linux:

```bash
git clone https://github.com/RealMCoded/ProgressCount95
cd ProgressCount95
npm install
cp config.template.json config.json # if you have already created the config, skip this!
$EDITOR config.json                 # if you have already created the config, skip this!
npm run start
```

For Windows:

```bash
git clone https://github.com/RealMCoded/ProgressCount95
cd ProgressCount95
npm install
copy config.template.json config.json # if you have already created the config, skip this!
notepad config.json                   # if you have already created the config, skip this!
npm run start
```

## Invite your bot!

Invite your bot with this link (Replace `[ClientID]` with your bot's ID!)
```
https://discord.com/oauth2/authorize?client_id=[ClientID]&permissions=8&scope=bot%20applications.commands
```

If you want to customize the permissions for whatever reason, check out the [Discord Permissions Calculator](https://discordapi.com/permissions.html) if you need help.

If you want more restricted permissions, try this one (View channels, Send messages, Add Reactions)

```
https://discord.com/oauth2/authorize?client_id=[ClientID]&permissions=3136&scope=bot%20applications.commands
```

## Slash commands

To register slash commands, run the following command:
```bash 
npm run register
```
