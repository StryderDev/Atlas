const chalk = require('chalk');
const { DateTime } = require('luxon');
const db = require('../../database.js');

module.exports = {
	name: 'messageCreate',
	once: false,
	async execute(message, client) {
		if (message.author.bot) return;

		if (message.member.roles.cache.some(role => role.name === 'Staff')) return;
		if (message.member.roles.cache.some(role => role.name === 'Retired Staff')) return;
		if (!message.member.roles.cache.some(role => role.name === 'Legend')) return;

		// Media Cooldown Check
		// Check if message contains an attachment OR a link
		if (message.attachments.size > 0 || message.content.includes('http')) {
			// message.reply('link');

			let addCooldownCounterQuery = 'INSERT INTO Atlas_MediaCooldown (discordID, messageID, messageContent, timestamp) VALUES (?, ?, ?, ?)';

			db.query(addCooldownCounterQuery, [message.author.id, message.id, message.content, Math.floor(DateTime.now().toSeconds())], (err, addCooldownCounterRow) => {
				if (err) {
					console.log(chalk.red(`${chalk.bold('[ATLAS]')} ${err}`));
					return false;
				}

				console.log(chalk.green(`${chalk.bold('[ATLAS]')} Inserted message cooldown row for ${message.author.tag}`));

				// Current Time - 300 seconds
				let timeSince = Math.floor(DateTime.now().minus({ minutes: 5 }).toSeconds());

				// Get the current count of rows from the table where the ID equals the authors ID
				let getCooldownCounterQuery = 'SELECT COUNT(*) FROM Atlas_MediaCooldown WHERE discordID = ? AND timestamp >= ?';

				db.query(getCooldownCounterQuery, [message.author.id, timeSince], (err, getCooldownCounterRow) => {
					if (err) {
						console.log(chalk.red(`${chalk.bold('[ATLAS]')} ${err}`));
						return false;
					}

					// If the count over the last x minutes is greater than y, apply the Media Cooldown role
					if (getCooldownCounterRow[0]['COUNT(*)'] >= process.env.MEDIA_COOLDOWN_THRESHOLD) {
						// Find the role via the role ID
						let role = message.guild.roles.cache.find(role => role.id === process.env.MEDIA_COOLDOWN_ROLE);

						// Check if the user already has the role
						if (message.member.roles.cache.some(r => r.id === role.id)) {
							return;
						} else {
							message.member.roles.add(role).catch(console.error);
						}

						console.log(chalk.yellow(`${chalk.bold('[ATLAS]')} ${message.author.tag} has been given the Media Cooldown role`));
					}
				});
			});
		} else {
			// message.reply('no link');
			console.log(chalk.yellow(`${chalk.bold('[ATLAS]')} ${message.author.tag} did not post a link or attachment`));
		}
	},
};
