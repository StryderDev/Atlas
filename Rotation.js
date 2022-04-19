const { Client, Intents, Collection } = require('discord.js');
const { discord } = require('./config.json');
const fs = require('fs');

const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

module.exports = { client };

client.commands = new Collection();

require('./handler.js')(client);

client.on('messageCreate', message => {
	if (message.content.startsWith(discord.prefix)) {
		const args = message.content.slice(discord.prefix.length).trimEnd().split(/ +/g);
		const commandName = args.shift();
		const command = client.commands.get(commandName);

		if (!command) return;

		command.run(client, message, args);
	}
});

const commands = fs.readdirSync('./Commands').filter(file => file.endsWith('.js'));

for (file of commands) {
	const commandName = file.split('.')[0];
	const command = require(`./Commands/${commandName}`);

	client.commands.set(commandName, command);
}

client.login(discord.token);
