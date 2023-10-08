const { EmbedBuilder } = require('discord.js');

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

			const statusEmbed = new EmbedBuilder().setTitle('Apex Legends Server Status').setDescription(`Last Updated: `);

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
