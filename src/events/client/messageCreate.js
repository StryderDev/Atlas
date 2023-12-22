const chalk = require('chalk');
const { DateTime } = require('luxon');
const db = require('../../database.js');
const { doesUserHaveSlowmode } = require('../../utils.js');

module.exports = {
	name: 'messageCreate',
	once: false,
	async execute(message, client) {
		if (message.author.bot) return;

		await doesUserHaveSlowmode(message);

		let slowmodeQuery = 'SELECT timestamp FROM pingCooldown WHERE userID = ?';

		db.query(slowmodeQuery, [message.author.id], async (err, slowmodeRow) => {
			if (err) return console.log(err);

			if (slowmodeRow.length != 0) {
				if (slowmodeRow[0].timestamp + parseInt(process.env.COOLDOWN_TIME) > Math.floor(DateTime.now().toSeconds())) {
					return;
				}
			}

			if (message.mentions.roles.first()) {
				if (message.mentions.roles.first().id == process.env.DISCORD_MOD_PING_ROLE_ID) {
					let addPingDataQuery = 'INSERT INTO messageData (messageID, userID, messageText, timestamp) VALUES (?, ?, ?, ?)';

					const messageContent = message.content
						.replace(/<@&[0-9]+>/g, '')
						.replace(/\s+/g, ' ')
						.trim();

					db.query(addPingDataQuery, [message.id, message.author.id, messageContent, Math.floor(DateTime.now().toSeconds())], (err, addPingDataRow) => {
						if (err) {
							console.log(chalk.red(`${chalk.bold('[REAPER]')} ${err}`));
							return false;
						}

						console.log(chalk.green(`${chalk.bold('[REAPER]')} Inserted ping data row for ${message.author.tag}`));
					});

					message.channel
						.send({
							content: `# <@${message.author.id}> Read Before Continuing!\n**This should only be used for emergencies. Server staff do *not* work for EA or Respawn.**\nAre you *sure* you want to ping server staff?\n\n*If it's not an emergency, please message <@542736472155881473>.*\n*You will be warned/muted if you abuse staff pings.*`,
							components: [
								{
									type: 1,
									components: [
										{
											type: 2,
											label: "Yes, it's an emergency, ping the mods!",
											style: 3,
											emoji: '<:Atlas_Confirm:1185767333680136272>',
											custom_id: `${message.id}-${message.author.id}-yes`,
										},
										{
											type: 2,
											label: 'No, I will message ModMail instead',
											style: 4,
											emoji: '<:Atlas_Deny:1185767332761579611>',
											custom_id: `${message.id}-${message.author.id}-no`,
										},
									],
								},
							],
						})
						.then(msg => {
							const channel = message.guild.channels.cache.get(message.channel.id);

							setTimeout(() => {
								channel.messages
									.fetch(msg.id)
									.then(fetchedMessage => {
										fetchedMessage
											.edit({
												content: 'Response was not received in time, canceling staff ping.',
												components: [],
											})
											.catch(err => console.log(chalk.yellow`${chalk.bold['[BOT]']} Could not delete message, it is likely already deleted`, err));

										setTimeout(() => {
											message.delete();
											fetchedMessage.delete();
										}, 5000);
									})
									.catch(err => {
										if (err.code === 10008) {
											console.log('Message already deleted');
										} else {
											console.log(err);
										}
									});
							}, 10000);
						});
				}
			}
		});
	},
};
