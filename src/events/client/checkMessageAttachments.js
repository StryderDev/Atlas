const chalk = require('chalk');
const { DateTime } = require('luxon');
const db = require('../../database.js');

module.exports = {
	name: 'messageCreate',
	once: false,
	async execute(message, client) {
		if (message.author.bot) return;

		// check if the user has the "legend" or "retired mod" roles
		if (!message.member.roles.cache.some(role => role.name === 'Legend') && !message.member.roles.cache.some(role => role.name === 'Retired Staff')) {
			console.log('INGORE!!!! LOLMAOMAWMDOA');

			return;
		}

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
			});
		} else {
			// message.reply('no link');
			console.log('does not contain image or link');
		}
	},
};
