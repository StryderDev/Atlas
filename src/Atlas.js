const chalk = require('chalk');
const dbConnection = require('./database.js');
const { DateTime } = require('luxon');
const { checkEntryPlural } = require('./utils.js');
const { Client, GatewayIntentBits } = require('discord.js');
const { Guilds, GuildMembers, GuildMessages, GuildPresences, MessageContent } = GatewayIntentBits;

Bun.env.TZ = 'America/Chicago';

const { loadEvents } = require('./loadEvents.js');

const client = new Client({ intents: [Guilds, GuildMembers, GuildMessages, GuildPresences, MessageContent] });

process.on('unhandledRejection', err => {
	console.log(`${chalk.red.bold('[ATLAS_BOT]')} Unhandled Rejection: ${chalk.red(err)}`);
});

process.on('uncaughtException', err => {
	console.log(`${chalk.red.bold('[ATLAS_BOT]')} Unhandled Exception: ${chalk.red(err)}`);
});

process.on('uncaughtExceptionMonitor', (err, origin) => {
	console.log(`${chalk.red.bold('[ATLAS_BOT]')} Uncaught Exception Monitor: ${chalk.red(err)}, ${chalk.red(origin)}`);
});

client
	.login(Bun.env.DISCORD_TOKEN)
	.then(() => {
		loadEvents(client);
	})
	.catch(err => console.log(`${chalk.red.bold('[ATLAS_BOT]')} Discord Gateway Error: ${chalk.red(err)}`));

async function deleteOldMessageData() {
	const timeSince = Math.floor(DateTime.now().minus({ hours: 12 }).toSeconds());

	// Run bun GC for testing
	Bun.gc(true);

	await dbConnection`SELECT COUNT(*) FROM atlas_mod_ping_message_data WHERE timestamp <= ${timeSince}`
		.then(async timeSinceCountRow => {
			const rowCount = timeSinceCountRow[0]['count'];

			if (rowCount > 0) {
				console.log(`${chalk.cyan.bold('[SENTRY]')} Running Mod Ping Message Data Cleanup Check...`);

				await dbConnection`DELETE FROM atlas_mod_ping_message_data WHERE timestamp <= ${timeSince}`
					.then(() => {
						console.log(
							`${chalk.green.bold('[SENTRY]')} Mod Ping Message Data Cleanup Check complete, deleted ${rowCount} ${checkEntryPlural(rowCount, 'entr')} from atlas_mod_ping_message_data`,
						);
					})
					.catch(err => {
						console.log(`${chalk.red.bold('[SENTRY]')} ${err}`);
					});
			}
		})
		.catch(err => {
			console.log(`${chalk.red.bold('[SENTRY]')} ${err}`);
		});
}

function deleteMediaCooldownMessages() {
	const timeSince = Math.floor(DateTime.now().minus({ minutes: 15 }).toSeconds());

	dbConnection`SELECT COUNT(*) FROM atlas_media_cooldown WHERE timestamp <= ${timeSince}`
		.then(timeSinceCountRow => {
			const rowCount = timeSinceCountRow[0]['count'];

			if (rowCount > 0) {
				console.log(chalk.cyan(`${chalk.bold('[SENTRY]')} Running Media Cooldown Cleanup Check...`));

				dbConnection`DELETE FROM atlas_media_cooldown WHERE timestamp <= ${timeSince}`
					.then(() => {
						console.log(
							`${chalk.green.bold('[SENTRY]')} Media Cooldown Cleanup Check complete, deleted ${rowCount} ${checkEntryPlural(rowCount, 'entr')} from atlas_media_cooldown`,
						);
					})
					.catch(err => {
						console.log(`${chalk.red.bold('[SENTRY]')} Error: ${err}`);
					});
			}
		})
		.catch(err => {
			console.log(`${chalk.red.bold('[SENTRY]')} Error: ${err}`);
		});
}

function removeMediaCooldown() {
	const timeSince = Math.floor(DateTime.now().minus({ minutes: Bun.env.MEDIA_COOLDOWN_TIME }).toSeconds());

	const serverID = Bun.env.SERVER_ID;

	// Add the Media Cooldown role to the cache
	const role = client.guilds.cache.get(serverID).roles.cache.find(role => role.id === Bun.env.MEDIA_COOLDOWN_ROLE);
	const members = role.members;

	// List every member in the role
	members.forEach(member => {
		// If the count is 0, do nothing
		if (member.roles.cache.size === 0) return;

		// Check the cooldown table to see if the user has a cooldown
		dbConnection`SELECT COUNT(*) FROM atlas_media_cooldown WHERE user_id = ${member.user.id} AND timestamp >= ${timeSince}`
			.then(timeSinceCountRow => {
				const rowCount = timeSinceCountRow[0]['count'];

				console.log(
					`${chalk.green.bold('[ATLAS_MEDIA-COOLDOWN]')} ${member.user.tag} has ${rowCount} media cooldown ${checkEntryPlural(rowCount, 'entr')} in the last ${Bun.env.MEDIA_COOLDOWN_TIME} minutes`,
				);

				if (rowCount < Bun.env.MEDIA_COOLDOWN_THRESHOLD) {
					// Remove the role from the user
					member.roles.remove(role).catch(console.error);
					console.log(`${chalk.yellow.bold('[ATLAS_MEDIA-COOLDOWN]')} ${member.user.tag} has been removed from the Media Cooldown role`);
				}
			})
			.catch(err => {
				console.log(`${chalk.red.bold('[ATLAS_MEDIA-COOLDOWN]')} ${err}`);
				return false;
			});
	});
}

// Delete old mod ping message data older than 12 hours
// Checks every hour
setInterval(deleteOldMessageData, 120000);

// Delete old media cooldown data older than 15 minutes
// Checks every 5 minutes
setInterval(deleteMediaCooldownMessages, 300000);

// Remove role from user after 5 minutes
// Checks every minute
setInterval(removeMediaCooldown, 60000);

module.exports = { client };
