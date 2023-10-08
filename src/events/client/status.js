const { EmbedBuilder } = require('discord.js');

const { emoteType } = require('../../utils.js');

module.exports = {
	name: 'ready',
	once: false,
	execute(client) {
		if (Bun.env.ENABLED == 'false') return;

		async function updateStatus() {
			// get javascript current unix timestamp
			const now = Date.now();
			const minute = new Date(now).getMinutes();

			// if minute is divisible by 5, continue
			if (minute % Bun.env.INTERVAL != 0) return;

			const statusURL = `https://api.mozambiquehe.re/servers?auth=${Bun.env.ALS_API}`;
			const statusResponse = await fetch(statusURL);
			const statusData = await statusResponse.json();

			const eaApp = statusData['Origin_login'];
			const crossplay = statusData['ApexOauth_Crossplay'];
			const eaAccounts = statusData['EA_accounts'];
			const novaFusion = statusData['EA_novafusion'];

			const statusEmbed = new EmbedBuilder()
				.setTitle('Apex Legends Server Status')
				.setDescription(`Last Updated: <t:${Math.floor(now / 1000)}:R>`)
				.addFields([
					{
						name: '[Crossplay] Apex Login',
						value: `${crossplay['EU-West'].Status}`,
					},
				]);

			const guild = client.guilds.cache.get(Bun.env.SERVER_ID);
			const channel = guild.channels.cache.get(Bun.env.CHANNEL_ID);

			channel.messages.fetch(Bun.env.MESSAGE_ID).then(msg => {
				msg.edit({ content: '', embeds: [statusEmbed] });
			});
		}

		updateStatus();

		setInterval(updateStatus, 60000);
	},
};
