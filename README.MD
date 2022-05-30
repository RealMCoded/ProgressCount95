# ProgressCount95

The counting bot for the Progressbar95 Fan Server - Now open sourced by request.

**[Trello Board](https://trello.com/b/WMZYOuTd/progresscount95)**

**Warning: The code used for this is very half assed and very unstable.**

## Known issues

- If an emoji doesn't exist and the bot tries to use it, the bot crashes. You can turn `useCustomEmoji` to `false` in the `config.json` file if you wish.
- The bot detects attachments and stickers as an invalid number.

## Required Files

The bot requires some files to be made that have been gitignored.

You can run the following command to generate these files:
```
node FIRSTRUN.JS
```

All you need to do is edit `config.json` with your own variables.

---

Alternatively, you can do it manually:

- Make 2 files in `data/` called `numb.txt` and `banned.json`. These files are required for the bot to store data.

- `banned.json` is a JSON array, so make sure your `banned.json` file includesthe following:
```
[]
```

- Copy `config.json.template`, rename it to `config.json` and replace the variables with your own.

## Buidling

The bot is built with Node.js.

---

Clone the repository with
```
git clone https://github.com/RealMCoded/ProgressCount95
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

For slash commands: Run `REGISTER_PROGRE.bat` for your release server or `REGISTER_TEST.bat` for your testing server. You can also run the following command:
```
node register-pw.js
```
or
```
node register-test.js
```
