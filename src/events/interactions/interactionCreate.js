const chalk = require('chalk');
const { InteractionType } = require('discord.js');

module.exports = {
	name: 'interactionCreate',
	once: false,
	async execute(interaction, client) {
		// if interaction is a button, set up the button handler
		if (interaction.isButton()) {
			// get button id
			const buttonId = interaction.customId;

			// the button id is in the format of messageID-buttonOption
			// split the 2 parts into separate strings
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
