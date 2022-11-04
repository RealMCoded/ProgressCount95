const { WebhookClient } = require('discord.js');
const { logHook, redirectConsoleOutputToWebhook } = require('../config.json');

module.exports = {
    log: (e) => {
        try {
            if (redirectConsoleOutputToWebhook) {
                let webhookClient = new WebhookClient({ url: logHook });
                webhookClient.send(`\`\`\`\n${e}\n\`\`\``);
            }
        } catch (err) {
            process.stdout.write(`Unable to redirect output: ${err}\n`);
        }
        process.stdout.write(`${e}\n`);
    },
    warn: (e) => {
        try {
            if (redirectConsoleOutputToWebhook) {
                let webhookClient = new WebhookClient({ url: logHook });
                webhookClient.send(`\`\`\`\n[WARN] ${e}\n\`\`\``);
            }
        } catch (err) {
            process.stdout.write(`Unable to redirect output: ${err}\n`);
        }
        process.stdout.write(`[WARN] ${e}\n`);
    },
    error: (e) => {
        try {
            if (redirectConsoleOutputToWebhook) {
                let webhookClient = new WebhookClient({ url: logHook });
                webhookClient.send(`\`\`\`\n[ERROR] ${e}\n\`\`\``);
            }
        } catch (err) {
            process.stdout.write(`Unable to redirect output: ${err}\n`);
        }
        process.stdout.write(`[ERROR] ${e}`);
    }
}