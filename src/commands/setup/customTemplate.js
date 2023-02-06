const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const { customs } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder().setName('customtemplate').setDescription('Enable custom submit embed.'),
	async execute(interaction) {
		await interaction.reply({ content: 'Posting custom lobby form embed.', ephemeral: true });

		let submitChannel = interaction.guild.channels.cache.get(customs.submitChannel);
		if (!submitChannel) return console.log('Submit channel not available');

		let submitEmbed = new EmbedBuilder()
			.setTitle('Custom Lobby Submission Form')
			.setDescription(
				'Custom lobbies are a great way to play with your friends and have fun! To submit a custom lobby, please fill out the form below. If you have any questions, please contact a staff member.',
			)
			.setThumbnail('https://i.sdcore.dev/95v93bqrh.png');

		let submitButtons = new ActionRowBuilder().addComponents([
			new ButtonBuilder().setCustomId('custom_modal').setStyle(ButtonStyle.Success).setLabel('Custom Lobby Submission Form').setEmoji('✏️'),
		]);

		await submitChannel.send({ embeds: [submitEmbed], components: [submitButtons] });
	},
};
