const chalk = require('chalk');
const { ActivityType } = require('discord.js');

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(chalk.green(`${chalk.bold('BOT:')} ${client.user.username} is Online.`));

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
