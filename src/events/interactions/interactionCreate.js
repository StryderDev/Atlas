const { InteractionType, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

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

		if (interaction.isButton()) {
			if (interaction.customId == 'customSubmitModal') {
				const submitModal = new ModalBuilder().setTitle('Custom Lobby Submission Form').setCustomId('customSubmitModal');

				// Server Region: EU
				// Map & Game Type: BR
				// Map: Varies
				// Lobby Mode: DUOS
				// Aim Assist Override: on
				// Code: ccm2em2o

				const serverRegion = new TextInputBuilder()
					.setCustomId('serverRegion')
					.setPlaceholder('NA, EU, OCE, ASIA, LATAM')
					.setLabel('Server Region')
					.setMinLength(2)
					.setMaxLength(30)
					.setRequired(true)
					.setStyle(TextInputStyle.Short);

				const mapGameType = new TextInputBuilder()
					.setCustomId('gameType')
					.setPlaceholder('Kings Canyon / BR')
					.setLabel('Map & Game Type')
					.setMinLength(2)
					.setMaxLength(100)
					.setRequired(true)
					.setStyle(TextInputStyle.Short);

				const lobbyMode = new TextInputBuilder()
					.setCustomId('lobbyMode')
					.setPlaceholder('Trios, Duos, Hide & Seek, etc.')
					.setLabel('Lobby Mode')
					.setMinLength(2)
					.setMaxLength(30)
					.setRequired(true)
					.setStyle(TextInputStyle.Short);

				const aimAssist = new TextInputBuilder()
					.setCustomId('aimAssist')
					.setPlaceholder('On / Off')
					.setLabel('Aim Assist Override')
					.setMinLength(2)
					.setMaxLength(30)
					.setRequired(true)
					.setStyle(TextInputStyle.Short);

				const lobbyCode = new TextInputBuilder()
					.setCustomId('lobbyCode')
					.setPlaceholder('cc2ceciu')
					.setLabel('Lobby Code')
					.setMinLength(7)
					.setMaxLength(9)
					.setRequired(true)
					.setStyle(TextInputStyle.Short);

				const regionRow = new ActionRowBuilder().addComponents(serverRegion);
				const mapTypeRow = new ActionRowBuilder().addComponents(mapGameType);
				const lobbyRow = new ActionRowBuilder().addComponents(lobbyMode);
				const aimAssistRow = new ActionRowBuilder().addComponents(aimAssist);
				const codeRow = new ActionRowBuilder().addComponents(lobbyCode);

				submitModal.addComponents(regionRow, mapTypeRow, lobbyRow, aimAssistRow, codeRow);

				await interaction.showModal(submitModal);
			}
		}
	},
};
