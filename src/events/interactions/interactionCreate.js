const chalk = require('chalk');
const dbConnection = require('../../database.js');
const { MessageFlags, InteractionType } = require('discord.js');

module.exports = {
	name: 'interactionCreate',
	once: false,
	async execute(interaction, client) {
		if (interaction.isButton()) {
			const buttonId = interaction.customId;

			const [messageId, authorId, buttonOption] = buttonId.split('-');

			// Handling Invite Generator Button Press
			if (buttonId === 'invite_button') {
				const guild = client.guilds.cache.get(Bun.env.INVITE_SERVER);
				const channel = guild.channels.cache.get(Bun.env.INVITE_TO_CHANNEL);

				// Get the current time in seconds + 86400 seconds (1 day)
				const expiryTime = Math.floor(Date.now() / 1000) + 86400;

				try {
					// Generate the invite
					const invite = await channel.createInvite({
						maxAge: 86400,
						maxUses: 1,
						unique: true,
					});

					// Send the invite URL back to the user
					interaction.reply({
						content: `Here is an auto-generated invite to  <#${channel.id}>: ${invite.url}\nThis invite will expire <t:${expiryTime}:R>, or when it is used **1** time.`,
						flags: MessageFlags.Ephemeral,
					});

					// Log the invite to the database
					const currentTime = Math.floor(Date.now() / 1000);

					await dbConnection`INSERT INTO atlas_invite_tracker (invite_code, invite_creator_id, timestamp) VALUES (${invite.code}, ${interaction.user.id}, ${currentTime})`
						.then(() => {
							console.log(`${chalk.green.bold('[SENTRY]')} Logged invite ${chalk.cyan.bold(invite.code)} for user ${chalk.cyan.bold(interaction.user.username)}`);
						})
						.catch(err => {
							console.log(`${chalk.red.bold('[SENTRY]')} Invite Tracker Error: ${err}`);
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

				dbConnection`SELECT * FROM atlas_mod_ping_message_data WHERE message_id = ${messageId}`.then(selectPingDataRow => {
					if (selectPingDataRow.length == 0) {
						console.log(chalk.red(`${chalk.bold('[REAPER]')} No ping data found for messageID ${messageId}`));
						return false;
					}

					if (selectPingDataRow.length != 0) {
						const pingData = selectPingDataRow[0];

						interaction.channel.send({
							content: `<@&${Bun.env.STAFF_ROLE_ID}> has been requested by <@${pingData.user_id}> \n**Context:** \`${pingData.message_text}\``,
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
