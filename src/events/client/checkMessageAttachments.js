const db = require('../../database.js');

module.exports = {
	name: 'messageCreate',
	once: false,
	async execute(message, client) {
		if (message.author.bot) return;

		// Media Cooldown Check
		// Check if message contains an attachment OR a link
		if (message.attachments.size > 0 || message.content.includes('http')) {
			message.reply('link');
			console.log('contains image or link');
		} else {
			message.reply('no link');
			console.log('does not contain image or link');
		}
	},
};
