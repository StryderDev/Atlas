const { EmbedBuilder } = require('discord.js');

const { formatStatus } = require('../../utils.js');

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
			const consoles = statusData['otherPlatforms'];

			const statusEmbed = new EmbedBuilder()
				.setTitle('Apex Legends Server Status')
				.setDescription(`Last Updated: <t:${Math.floor(now / 1000)}:R>`)
				.addFields([
					{
						name: 'Console Services',
						value: `**Xbox Live:** ${consoles['Xbox-Live']['Status']}`,
						inline: true,
					},
					{
						name: '\u200b',
						value: `**PlayStation Network:** ${consoles['Playstation-Network']['Status']}`,
						inline: true,
					},
					{
						name: '\u200b',
						value: `\u200b`,
						inline: true,
					},
					{
						name: '[Crossplay] Apex Login',
						value: `${formatStatus(crossplay)}`,
						inline: true,
					},
					{
						name: 'EA Login',
						value: `${formatStatus(eaApp)}`,
						inline: true,
					},
					{
						name: '\u200b',
						value: `\u200b`,
						inline: true,
					},
					{
						name: 'EA Accounts',
						value: `${formatStatus(eaAccounts)}`,
						inline: true,
					},
					{
						name: 'Lobby & Matchmaking Services',
						value: `${formatStatus(novaFusion)}`,
						inline: true,
					},
					{
						name: '\u200b',
						value: `\u200b`,
						inline: true,
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
