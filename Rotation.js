const { Client, Intents, Collection, MessageEmbed } = require('discord.js');
const { discord, api, status } = require('./config.json');
const { serverStatus } = require('./data/emotes.json');
const fs = require('fs');
const { default: axios } = require('axios');

const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.commands = new Collection();

client.on('ready', () => {
	console.log(`Logging in to ${client.user.username}...`);
	console.log(`Logged in to ${client.user.username}!`);

	client.user.setPresence({ activities: [{ name: 'the Apex servers', type: 'WATCHING' }] }, { status: 'online' });

	function statusLayout(type) {
		function getEmote(status) {
			if (status == 'UP') return serverStatus.Online;
			if (status == 'SLOW') return serverStatus.Slow;
			if (status == 'DOWN' || status == 'OVERLOADED') return serverStatus.Down;
		}

		return `${getEmote(type['US-East']['Status'])} **US East:** ${type['US-East']['ResponseTime']}ms\n${getEmote(type['US-Central']['Status'])} **US Central:** ${
			type['US-Central']['ResponseTime']
		}ms\n${getEmote(type['US-West']['Status'])} **US West:** ${type['US-West']['ResponseTime']}ms\n${getEmote(type['EU-East']['Status'])} **EU East:** ${
			type['EU-East']['ResponseTime']
		}ms\n${getEmote(type['EU-West']['Status'])} **EU West:** ${type['EU-West']['ResponseTime']}ms\n${getEmote(type['SouthAmerica']['Status'])} **South America:** ${
			type['SouthAmerica']['ResponseTime']
		}ms\n${getEmote(type['Asia']['Status'])} **Asia:** ${type['Asia']['ResponseTime']}ms`;
	}

	async function updateStatus() {
		(function loop() {
			if (new Date().getMinutes() % status.interval == 0) {
				axios.get(`https://api.mozambiquehe.re/servers?auth=${api.apex}`).then(response => {
					const data = response.data;

					const origin = data['Origin_login'];
					const apex = data['ApexOauth_Crossplay'];
					const accounts = data['EA_accounts'];
					const novafusion = data['EA_novafusion'];

					const statusEmbed = new MessageEmbed()
						.setTitle('Apex Legends Server Status')
						.addField('[Crossplay] Apex Login', statusLayout(origin), true)
						.addField('Origin Login', statusLayout(apex), true)
						.addField(`\u200b`, `\u200b`, true)
						.addField('EA Accounts', statusLayout(accounts), true)
						.addField('EA Novafusion', statusLayout(novafusion), true)
						.addField(`\u200b`, `\u200b`, true)
						.setFooter({
							text: 'Status data provided by https://apexlegendsstatus.com/',
						})
						.setTimestamp();

					const guild = client.guilds.cache.get(status.server);
					if (!guild) return console.log('Guild not available.');

					const channel = guild.channels.cache.find(c => c.id === status.channel);
					if (!channel) return console.log('Channel not available.');

					try {
						const message = channel.messages.fetch(status.message);
						if (!message) return console.log('Message not available.');

						channel.messages.fetch(status.message).then(msg => {
							msg.edit({ embeds: [statusEmbed] });
						});

						console.log('Updated server status embed.');
					} catch (err) {
						console.log(err);
					}
				});
			}

			now = new Date();
			var delay = 60000 - (now % 60000);
			setTimeout(loop, delay);
			console.log('Checking status rotation...');
		})();
	}

	updateStatus();
});

const commands = fs.readdirSync('./Commands').filter(file => file.endsWith('.js'));

for (file of commands) {
	const commandName = file.split('.')[0];
	const command = require(`./Commands/${commandName}`);

	client.commands.set(commandName, command);
}

client.on('messageCreate', message => {
	if (message.content.startsWith(discord.prefix)) {
		const args = message.content.slice(discord.prefix.length).trimEnd().split(/ +/g);
		const commandName = args.shift();
		const command = client.commands.get(commandName);

		if (!command) return;

		command.run(client, message, args);
	}
});

client.login(discord.token);
