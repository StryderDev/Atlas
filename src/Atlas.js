const chalk = require('chalk');
const db = require('./database.js');
const { DateTime } = require('luxon');
const { checkEntryPlural } = require('./utils.js');
const { Client, GatewayIntentBits } = require('discord.js');
const { Guilds, GuildMembers, GuildMessages, GuildPresences, MessageContent } = GatewayIntentBits;

const { loadEvents } = require('./loadEvents.js');

const client = new Client({ intents: [Guilds, GuildMembers, GuildMessages, GuildPresences, MessageContent] });

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
	.login(Bun.env.DISCORD_TOKEN)
	.then(() => {
		loadEvents(client);
	})
	.catch(err => console.log(err));

function deleteOldMessageData() {
	const timeSince = Math.floor(DateTime.now().minus({ hours: 12 }).toSeconds());

	const timeSinceCount = `SELECT COUNT(*) FROM messageData WHERE timestamp <= ?`;

	db.query(timeSinceCount, timeSince, (err, timeSinceCountRow) => {
		if (err) {
			console.log(chalk.bold.red(`${chalk.bold('[SPYGLASS]')} Error: ${err}`));
		}

		const rowCount = timeSinceCountRow[0]['COUNT(*)'];

		if (rowCount > 0) {
			console.log(chalk.cyan(`${chalk.bold('[SPYGLASS]')} Running Cooldown Cleanup Check...`));

			const deleteOldCooldownEntries = `DELETE FROM messageData WHERE timestamp <= ?`;

			db.query(deleteOldCooldownEntries, timeSince, err => {
				if (err) {
					console.log(chalk.bold.red(`${chalk.bold('[SPYGLASS]')} Error: ${err}`));
				}
			});

			console.log(chalk.green(`${chalk.bold('[SPYGLASS]')} Cooldown Cleanup Check complete, deleted ${rowCount} ${checkEntryPlural(rowCount, 'entr')} from pingCooldown`));
		}
	});
}

function deleteMediaCooldownMessages() {
	const timeSince = Math.floor(DateTime.now().minus({ minutes: 15 }).toSeconds());

	const timeSinceCount = `SELECT COUNT(*) FROM Atlas_MediaCooldown WHERE timestamp <= ?`;

	db.query(timeSinceCount, timeSince, (err, timeSinceCountRow) => {
		if (err) {
			console.log(chalk.bold.red(`${chalk.bold('[SPYGLASS]')} Error: ${err}`));
		}

		const rowCount = timeSinceCountRow[0]['COUNT(*)'];

		if (rowCount > 0) {
			console.log(chalk.cyan(`${chalk.bold('[SPYGLASS]')} Running Media Cooldown Cleanup Check...`));

			const deleteOldCooldownEntries = `DELETE FROM Atlas_MediaCooldown WHERE timestamp <= ?`;

			db.query(deleteOldCooldownEntries, timeSince, (err, result) => {
				if (err) {
					console.log(chalk.bold.red(`${chalk.bold('[SPYGLASS]')} Error: ${err}`));
				}
			});

			console.log(
				chalk.green(
					`${chalk.bold('[SPYGLASS]')} Media Cooldown Cleanup Check complete, deleted ${rowCount} ${checkEntryPlural(rowCount, 'entr')} from Atlas_MediaCooldown`,
				),
			);
		}
	});
}

function removeMediaCooldown() {
	const timeSince = Math.floor(DateTime.now().minus({ minutes: Bun.env.MEDIA_COOLDOWN_TIME }).toSeconds());

	const timeSinceCount = `SELECT COUNT(*) FROM Atlas_MediaCooldown WHERE discordID = ? AND timestamp >= ?`;

	const serverID = Bun.env.SERVER_ID;

	// Add the Media Cooldown role to the cache
	const role = client.guilds.cache.get(serverID).roles.cache.find(role => role.id === Bun.env.MEDIA_COOLDOWN_ROLE);
	const members = role.members;

	// List every member in the role
	members.forEach(member => {
		// If the count is 0, do nothing
		if (member.roles.cache.size === 0) return;

		// Check the cooldown table to see if the user has a cooldown
		db.query(timeSinceCount, [member.user.id, timeSince], (err, timeSinceCountRow) => {
			if (err) {
				console.log(chalk.red(`${chalk.bold('[ATLAS]')} ${err}`));
				return false;
			}

			const rowCount = timeSinceCountRow[0]['COUNT(*)'];

			console.log(
				chalk.green(`${chalk.bold('[ATLAS]')} ${member.user.tag} has ${rowCount} ${checkEntryPlural(rowCount, 'entr')} in the last ${Bun.env.MEDIA_COOLDOWN_TIME} minutes`),
			);

			if (rowCount < Bun.env.MEDIA_COOLDOWN_THRESHOLD) {
				// Remove the role from the user
				member.roles.remove(role).catch(console.error);
				console.log(chalk.yellow(`${chalk.bold('[ATLAS]')} ${member.user.tag} has been removed from the Media Cooldown role`));
			}
		});
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
