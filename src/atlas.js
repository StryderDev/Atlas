const chalk = require('chalk');
const { Client, GatewayIntentBits } = require('discord.js');

Bun.env.TZ = 'America/Chicago';

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildPresences, GatewayIntentBits.MessageContent],
});

client
	.login(Bun.env.DISCORD_TOKEN)
	.then(() => {
		console.log(`${chalk.yellow.bold('[ATLAS_BOT]')} Logging in...`);
		console.log(`${chalk.green.bold('[ATLAS_BOT]')} Discord Client Login Successful`);
	})
	.catch(err => {
		console.log(`${chalk.red.bold('[ATLAS_BOT]')} Discord Client Gateway Error: ${err.message}`);
	});
