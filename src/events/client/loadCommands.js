const fs = require('fs');
const { Collection, REST, Routes } = require('discord.js');

const { debug, discord } = require('../../config.json');
const rest = new REST({ version: '10' }).setToken(discord.token);
const commandFolders = fs.readdirSync(__dirname + `/../../commands`);

const commands = [];

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		client.commands = new Collection();

		for (const folder of commandFolders) {
			const commandFiles = fs.readdirSync(__dirname + `/../../commands/${folder}`).filter(file => file.endsWith('.js'));

			for (const file of commandFiles) {
				const command = require(`../../commands/${folder}/${file}`);

				commands.push(command.data.toJSON());
				client.commands.set(command.data.name, command);
			}
		}

		(async () => {
			try {
				if (debug.true == false) {
					await rest.put(Routes.applicationCommands(client.user.id), { body: commands });

					console.log(`[>> Successfully registered global slash commands]`);
				} else {
					await rest.put(Routes.applicationGuildCommands(client.user.id, debug.guild), { body: commands });

					console.log(`[>> Successfully registered local slash commands]`);
				}
			} catch (error) {
				if (error) console.log(error);
			}
		})();
	},
};
