const { Client, GatewayIntentBits } = require('discord.js');
const { Guilds, GuildMembers, GuildMessages } = GatewayIntentBits;

const { discord } = require('./config.json');
const { loadEvents } = require('./loadEvents.js');

const client = new Client({ intents: [Guilds, GuildMembers, GuildMessages] });

client
	.login(discord.token)
	.then(() => {
		loadEvents(client);
	})
	.catch(err => console.log(err));

module.exports = { client };
