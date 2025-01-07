const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		async function inviteEmbed() {
			const guild = client.guilds.cache.get(process.env.INVITE_SERVER);
			const channel = guild.channels.cache.get(process.env.INVITE_CHANNEL);

			const inviteEmbed = new EmbedBuilder().setTitle('Invite').setDescription('press button to generate invite');

			let signupButtons = new ActionRowBuilder().addComponents([
				new ButtonBuilder().setCustomId('invite_button').setStyle(ButtonStyle.Primary).setLabel('Generate Temporary Invite'),
			]);

			channel.messages.fetch(process.env.INVITE_MESSAGE).then(msg => {
				msg.edit({
					content: '',
					embeds: [inviteEmbed],
					components: [signupButtons],
				});
			});
		}

		inviteEmbed();
	},
};
