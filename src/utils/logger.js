const { WebhookClient } = require('discord.js');
const { logHook, redirectConsoleOutputToWebhook } = require('../config.json');

const webhookClient = new WebhookClient({ url: logHook });

function sendWebhook(content) {
    try {
        webhookClient.send(content)
    } catch (err) {
        process.stdout.write(`Unable to redirect output: ${err}\n`);
    }
}

module.exports = {
    log: (e) => {
        if (redirectConsoleOutputToWebhook) sendWebhook(`\`\`\`\n${e}\n\`\`\``);
        process.stdout.write(`${e}\n`);
    },
    warn: (e) => {
        if (redirectConsoleOutputToWebhook) sendWebhook(`\`\`\`\n[WARN] ${e}\n\`\`\``);
        process.stdout.write(`[WARN] ${e}\n`);
    },
    error: (e) => {
        if (redirectConsoleOutputToWebhook) sendWebhook(`\`\`\`\n[ERROR] ${e}\n\`\`\``);
        process.stdout.write(`[ERROR] ${e}`);
    }
}