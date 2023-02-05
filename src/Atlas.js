const { Client, ActivityType, GatewayIntentBits, ApplicationCommandType } = require('discord.js');

const config = require('./config.json');

const { Guilds, GuildMessages } = GatewayIntentBits;

const client = new Client({ intents: [Guilds, GuildMessages] });

client.on('ready', async () => {
	console.log(`${client.user.username} is Online.`);

	client.user.setPresence({
		activities: [
			{
				type: ActivityType.Watching,
				name: `Apex Legends`,
			},
		],
	});
});

client.login(config.discord.token);
