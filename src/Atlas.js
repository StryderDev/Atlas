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

		const rowCount = timeSinceCountRow[0]['COUNT(*)'];

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

function deleteMediaCooldownMessages() {
	const timeSince = Math.floor(DateTime.now().minus({ minutes: 15 }).toSeconds());

	const timeSinceCount = `SELECT COUNT(*) FROM Atlas_MediaCooldown WHERE timestamp <= ?`;

	db.query(timeSinceCount, timeSince, (err, timeSinceCountRow) => {
		if (err) {
			console.log(chalk.bold.red(`${chalk.bold('[ATLAS]')} Error: ${err}`));
		}

		const rowCount = timeSinceCountRow[0]['COUNT(*)'];

		if (rowCount > 0) {
			console.log(chalk.cyan(`${chalk.bold('[ATLAS]')} Running Media Cooldown Cleanup Check...`));

			const deleteOldCooldownEntries = `DELETE FROM Atlas_MediaCooldown WHERE timestamp <= ?`;

			db.query(deleteOldCooldownEntries, timeSince, (err, result) => {
				if (err) {
					console.log(chalk.bold.red(`${chalk.bold('[ATLAS]')} Error: ${err}`));
				}
			});

			console.log(
				chalk.green(`${chalk.bold('[ATLAS]')} Media Cooldown Cleanup Check complete, deleted ${rowCount} ${checkEntryPlural(rowCount, 'entr')} from Atlas_MediaCooldown`),
			);
		}
	});
}

function removeMediaCooldown() {
	const timeSince = Math.floor(DateTime.now().minus({ minutes: 5 }).toSeconds());

	const timeSinceCount = `SELECT COUNT(*) FROM Atlas_MediaCooldown WHERE timestamp <= ?`;

	db.query(timeSinceCount, timeSince, (err, timeSinceCountRow) => {
		if (err) {
			console.log(chalk.bold.red(`${chalk.bold('[ATLAS]')} Error: ${err}`));
		}

		const rowCount = timeSinceCountRow[0]['COUNT(*)'];

		if (rowCount > 0) {
			console.log(chalk.cyan(`${chalk.bold('[ATLAS]')} Running Media Cooldown Removal Check...`));

			const getCooldownEntries = `SELECT * FROM Atlas_MediaCooldown WHERE timestamp <= ?`;

			db.query(getCooldownEntries, timeSince, (err, cooldownEntries) => {
				if (err) {
					console.log(chalk.bold.red(`${chalk.bold('[ATLAS]')} Error: ${err}`));
				}

				cooldownEntries.forEach(entry => {
					const member = client.guilds.cache.get(process.env.GUILD_ID).members.cache.get(entry.discordID);

					if (member) {
						const role = member.guild.roles.cache.find(role => role.id === process.env.MEDIA_COOLDOWN_ROLE);

						if (role) {
							member.roles.remove(role).catch(console.error);
						}
					}
				});

				console.log(
					chalk.green(
						`${chalk.bold('[ATLAS]')} Media Cooldown Removal Check complete, removed ${rowCount} ${checkEntryPlural(rowCount, 'entr')} from Atlas_MediaCooldown`,
					),
				);
			});
		}
	});
}

// Delete old mod ping message data older than 12 hours
// Checks every hour
setInterval(deleteOldMessageData, 3600000);

// Delete old media cooldown data older than 15 minutes
// Checks every minute
setInterval(deleteMediaCooldownMessages, 60000);

// Remove role from user after 5 minutes
// Checks every minute
setInterval(removeMediaCooldown, 60000);

module.exports = { client };
