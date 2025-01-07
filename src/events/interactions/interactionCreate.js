const chalk = require('chalk');
const db = require('../../database.js');
const { InteractionType } = require('discord.js');

module.exports = {
	name: 'interactionCreate',
	once: false,
	async execute(interaction, client) {
		if (interaction.isButton()) {
			const buttonId = interaction.customId;

			const [messageId, authorId, buttonOption] = buttonId.split('-');

			// Handling Invite Generator Button Press
			if (buttonId === 'invite_button') {
				const guild = client.guilds.cache.get(process.env.INVITE_SERVER);
				const channel = guild.channels.cache.get(process.env.INVITE_TO_CHANNEL);

				// Get the current time in seconds + 86400 seconds (1 day)
				const expiryTime = Math.floor(Date.now() / 1000) + 86400;

				try {
					// Generate the invite
					const invite = await channel.createInvite({
						maxAge: 86400, // Expiry time in seconds (1 hour in this case)
						maxUses: 1, // Maximum number of uses (optional)
						unique: true, // Ensures the invite is unique (optional)
					});

					// Send the invite URL back to the user
					interaction.reply({
						content: `Here is an auto-generated invite to  <#${channel.id}>: ${invite.url}\nThis invite will expire <t:${expiryTime}:R>, or when it is used **1** time.`,
						ephemeral: true,
					});
				} catch (error) {
					console.error(error);
					interaction.reply({ content: 'There was an error generating the invite.', ephemeral: true });
				}
			}

			// Check whether the button is for mod pings
			// TODO: Rewrite this to be specific for mod pings vs. invite pings
			// TODO: instead of being hardcoded for each
			if ((buttonOption === 'no' || buttonOption === 'yes') && authorId != interaction.user.id)
				return interaction.reply({ content: 'Only the user who requested the mod ping can select an option.', ephemeral: true });

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
							content: `<@&${process.env.STAFF_ROLE_ID}> has been requested by <@${pingData.userID}> \n**Context:** \`${pingData.messageText}\``,
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
				console.log(chalk.red(`${chalk.bold('[COMMAND]')} ${error}`));
			}
		}
	},
};
