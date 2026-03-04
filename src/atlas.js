const chalk = require('chalk');
const { Client, GatewayIntentBits, Options } = require('discord.js');

Bun.env.TZ = 'America/Chicago';

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildPresences, GatewayIntentBits.MessageContent],
	makeCache: Options.cacheWithLimits({
		MessageManager: 100,
		PresenceManager: 0,
		ReactionManager: 0,
		GuildMemberManager: {
			maxSize: 125,
			keepOverLimit: member => member.id === member.client.user.id,
		},
	}),
	sweepers: {
		messages: {
			interval: 60 * 15,
			lifetime: 60 * 30,
		},
		users: {
			interval: 60 * 30,
			filter: () => user => user.bot && user.id !== user.client.user.id,
		},
	},
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
