const chalk = require('chalk');
const process = require('node:process');
const { Client, GatewayIntentBits } = require('discord.js');
const { Guilds, GuildMembers, GuildMessages } = GatewayIntentBits;

const { loadEvents } = require('./loadEvents.js');

const client = new Client({ intents: [Guilds, GuildMembers, GuildMessages] });

process.on('unhandledRejection', async (reason, promise) => {
	console.log(chalk.red(`${chalk.bold('[BOT]')} Unhandled Rejection at: ${promise}, reason:, ${reason}`));
});

process.on('uncaughtException', err => {
	console.log(chalk.red(`${chalk.bold('[BOT]')} Unhandled Exception: ${err}`));
});

process.on('uncaughtExceptionMonitor', (err, origin) => {
	console.log(chalk.red(`${chalk.bold('[BOT]')} Uncaught Exception Monitor: ${err}, ${origin}`));
});

client
	.login(Bun.env.DISCORD_TOKEN)
	.then(() => {
		loadEvents(client);
	})
	.catch(err => console.log(err));

module.exports = { client };
