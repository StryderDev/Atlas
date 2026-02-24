const chalk = require('chalk');
const { DateTime } = require('luxon');
const dbConnection = require('../../database.js');
// const { db_Spyglass } = require('../../database.js');

// mediaCooldown
// pingCooldown
// messageData
// inviteTracker

module.exports = {
	name: 'messageCreate',
	once: false,
	async execute(message) {
		if (message.author.bot) return;

		if (message.member.roles.cache.some(role => role.name === 'Staff')) return;
		if (message.member.roles.cache.some(role => role.name === 'Retired Staff')) return;
		if (!message.member.roles.cache.some(role => role.name === 'Legend')) return;

		// Media Cooldown Check
		// Check if message contains an attachment OR a link
		if (message.attachments.size > 0 || message.content.includes('http')) {
			await dbConnection`INSERT INTO atlas_media_cooldown (user_id, message_id, message_content, timestamp) VALUES (${message.author.id}, ${message.id}, ${message.content}, ${Math.floor(DateTime.now().toSeconds())})`
				.then(() => {
					console.log(`${chalk.green.bold('[SENTRY]')} Inserted message cooldown row for ${message.author.tag}`);

					// Current Time - Media Threshold Cooldown Time in Seconds
					let timeSince = Math.floor(DateTime.now().minus({ minutes: Bun.env.MEDIA_COOLDOWN_TIME }).toSeconds());

					// Get the current count of rows from the table where the ID equals the authors ID
					dbConnection`SELECT COUNT(*) FROM atlas_media_cooldown WHERE user_id = ${message.author.id} AND timestamp >= ${timeSince}`
						.then(getCooldownCounterRow => {
							// If the count over the last x minutes is greater than y, apply the Media Cooldown role
							if (getCooldownCounterRow[0]['count'] >= Bun.env.MEDIA_COOLDOWN_THRESHOLD) {
								// Find the role via the role ID
								let role = message.guild.roles.cache.find(role => role.id === Bun.env.MEDIA_COOLDOWN_ROLE);

								// Check if the user already has the role
								if (message.member.roles.cache.some(r => r.id === role.id)) {
									return;
								} else {
									message.member.roles.add(role).catch(console.error);
								}

								console.log(`${chalk.yellow.bold('[ATLAS_MEDIA-COOLDOWN]')} ${message.author.tag} has been given the Media Cooldown role`);
							}
						})
						.catch(err => {
							console.log(`${chalk.red.bold('[SENTRY]')} ${err}`);
							return false;
						});
				})
				.catch(err => {
					console.log(`${chalk.red.bold('[SENTRY]')} ${err}`);
					return false;
				});
		} else {
			console.log(`${chalk.yellow.bold('[ATLAS_MEDIA-COOLDOWN]')} ${message.author.tag} did not post a link or attachment`);
		}
	},
};
