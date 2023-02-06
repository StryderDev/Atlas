const { ActivityType } = require('discord.js');

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`${client.user.username} is Online.`);

		client.user.setPresence({
			activities: [
				{
					type: ActivityType.Playing,
					name: `Apex Legends`,
				},
			],
		});
	},
};
