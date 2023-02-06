const { InteractionType } = require('discord.js');

module.exports = {
	name: 'interactionCreate',
	once: false,
	async execute(interaction, client) {
		// Normal Slash Command
		if (interaction.type === InteractionType.ApplicationCommand) {
			const command = client.commands.get(interaction.commandName);

			if (!command) return;

			try {
				await command.execute(interaction);
				console.log(`[>>>> Command Ran: /${interaction.commandName}]`);
			} catch (err) {
				if (err) console.error(err);

				await interaction.reply({ content: 'An error has occured.', embeds: [] });
			}
		}
	},
};
