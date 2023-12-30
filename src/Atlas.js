const chalk = require('chalk');
const dotenv = require('dotenv');
const db = require('./database.js');
const { DateTime } = require('luxon');
const { checkEntryPlural } = require('./utils.js');
const { Client, GatewayIntentBits } = require('discord.js');
const { Guilds, GuildMembers, GuildMessages, MessageContent } = GatewayIntentBits;

dotenv.config();

const { loadEvents } = require('./loadEvents.js');

const client = new Client({ intents: [Guilds, GuildMembers, GuildMessages, MessageContent] });

process.on('unhandledRejection', err => {
	console.log(chalk.red(`${chalk.bold('[BOT]')} Unhandled Rejection: ${err}`));
});

process.on('uncaughtException', err => {
	console.log(chalk.red(`${chalk.bold('[BOT]')} Unhandled Exception: ${err}`));
});

process.on('uncaughtExceptionMonitor', (err, origin) => {
	console.log(chalk.red(`${chalk.bold('[BOT]')} Uncaught Exception Monitor: ${err}, ${origin}`));
});

client
	.login(process.env.DISCORD_TOKEN)
	.then(() => {
		loadEvents(client);
	})
	.catch(err => console.log(err));

function deleteOldMessageData() {
	const timeSince = Math.floor(DateTime.now().minus({ hours: 12 }).toSeconds());

	const timeSinceCount = `SELECT COUNT(*) FROM messageData WHERE timestamp <= ?`;

	db.query(timeSinceCount, timeSince, (err, timeSinceCountRow) => {
		if (err) {
			console.log(chalk.bold.red(`${chalk.bold('[REAPER]')} Error: ${err}`));
		}

		const rowCount = timeSinceCountRow[0]['count(*)'];

		if (rowCount > 0) {
			console.log(chalk.cyan(`${chalk.bold('[REAPER]')} Running Cooldown Cleanup Check...`));

			const deleteOldCooldownEntries = `DELETE FROM messageData WHERE timestamp <= ?`;

			db.query(deleteOldCooldownEntries, timeSince, (err, result) => {
				if (err) {
					console.log(chalk.bold.red(`${chalk.bold('[REAPER]')} Error: ${err}`));
				}
			});

			console.log(chalk.green(`${chalk.bold('[REAPER]')} Cooldown Cleanup Check complete, deleted ${rowCount} ${checkEntryPlural(rowCount, 'entr')} from pingCooldown`));
		}
	});
}

setInterval(deleteOldMessageData, 60000);

module.exports = { client };
