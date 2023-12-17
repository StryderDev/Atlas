const chalk = require('chalk');
const db = require('../../database.js');
const { InteractionType } = require('discord.js');

module.exports = {
	name: 'interactionCreate',
	once: false,
	async execute(interaction, client) {
		if (interaction.isButton()) {
			const buttonId = interaction.customId;

			const [messageId, buttonOption] = buttonId.split('-');

			if (buttonOption === 'no') {
				interaction.message.delete();

				interaction.channel
					.send({
						content: 'Staff ping canceled, initiating cleanup...',
					})
					.then(msg => {
						setTimeout(() => {
							client.channels.fetch(interaction.channel.id).then(channel => {
								channel.messages.delete(messageId);
							});

							msg.delete();
						}, 5000);
					});

				return;
			}

			if (buttonOption === 'yes') {
				interaction.message.delete();

				const selectPingData = `SELECT * FROM messageData WHERE messageID = ?`;

				db.query(selectPingData, [messageId], (err, selectPingDataRow) => {
					if (err) {
						console.log(chalk.red(`${chalk.bold('[REAPER]')} ${err}`));
						return false;
					}

					if (selectPingDataRow.length != 0) {
						const pingData = selectPingDataRow[0];

						interaction.channel.send({
							content: `**staff:** <@&${process.env.STAFF_ROLE_ID}> requested by <@${pingData.userID}> \n**context:** ${pingData.messageText}`,
						});
					}
				});
			}
		}

		if (interaction.type === InteractionType.ApplicationCommand) {
			const command = client.commands.get(interaction.commandName);

			if (!command) return;

			try {
				await command.execute(interaction);
				console.log(chalk.blue(`${chalk.bold('[COMMAND]')} ${interaction.user.username} used /${interaction.commandName}`));
			} catch (error) {
				console.log(error);
			}
		}
	},
};
