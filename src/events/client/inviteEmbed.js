const { ButtonStyle, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');

module.exports = {
	name: 'clientReady',
	once: true,
	execute(client) {
		async function inviteEmbed() {
			const guild = client.guilds.cache.get(process.env.INVITE_SERVER);
			const channel = guild.channels.cache.get(process.env.INVITE_CHANNEL);

			const inviteEmbed = new EmbedBuilder()
				.setTitle('Invite Generator')
				.setDescription(`Press the button below to generate an invite.\nThe invite lasts for 1 day and has 1 use.`);

			let signupButtons = new ActionRowBuilder().addComponents([
				new ButtonBuilder().setCustomId('invite_button').setStyle(ButtonStyle.Secondary).setLabel('Generate Temporary Invite'),
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
