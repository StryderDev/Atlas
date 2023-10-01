const chalk = require('chalk');
const { DateTime } = require('luxon');
const { EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'ready',
	once: false,
	execute(client) {
		if (process.env.ENABLED == 'false') return;

		function statusLayout(type) {
			function getEmote(status) {
				if (status == 'UP') return process.env.EMOTE_UP !== false && process.env.EMOTE_UP !== '' ? process.env.EMOTE_UP : '🟢';

				if (status == 'SLOW') return process.env.EMOTE_SLOW !== false && process.env.EMOTE_SLOW !== '' ? process.env.EMOTE_SLOW : '🟡';

				if (status == 'DOWN') return process.env.EMOTE_DOWN !== false && process.env.EMOTE_DOWN !== '' ? process.env.EMOTE_DOWN : '🔴';
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
			function checkStatus(status) {
				if (status['EU-West'].Status == 'UP') {
					var EUWest = 0;
				} else if (status['EU-West'].Status == 'SLOW') {
					var EUWest = 1;
				} else {
					var EUWest = 3;
				}

				if (status['EU-East'].Status == 'UP') {
					var EUEast = 0;
				} else if (status['EU-East'].Status == 'SLOW') {
					var EUEast = 1;
				} else {
					var EUEast = 3;
				}

				if (status['US-West'].Status == 'UP') {
					var USWest = 0;
				} else if (status['US-West'].Status == 'SLOW') {
					var USWest = 1;
				} else {
					var USWest = 3;
				}

				if (status['US-East'].Status == 'UP') {
					var USEast = 0;
				} else if (status['US-East'].Status == 'SLOW') {
					var USEast = 1;
				} else {
					var USEast = 3;
				}

				if (status['US-Central'].Status == 'UP') {
					var USCentral = 0;
				} else if (status['US-Central'].Status == 'SLOW') {
					var USCentral = 1;
				} else {
					var USCentral = 3;
				}

				if (status['SouthAmerica'].Status == 'UP') {
					var SouthAmerica = 0;
				} else if (status['SouthAmerica'].Status == 'SLOW') {
					var SouthAmerica = 1;
				} else {
					var SouthAmerica = 3;
				}

				if (status['Asia'].Status == 'UP') {
					var Asia = 0;
				} else if (status['Asia'].Status == 'SLOW') {
					var Asia = 1;
				} else {
					var Asia = 3;
				}

				return EUWest + EUEast + USWest + USEast + USCentral + SouthAmerica + Asia;
			}

			function annoCheck(start, length) {
				const date = Math.floor(Date.now() / 1000);

				if (date - start <= length) return true;

				return false;
			}

			(async function loop() {
				if (new Date().getMinutes() % 1 == 0) {
					let serverStatus = `https://api.mozambiquehe.re/servers?auth=${process.env.ALS_API}`;
					const statusResponse = await fetch(serverStatus);
					const data = await statusResponse.json();

					const dt = DateTime.now().setZone('America/Chicago');

					if (dt.weekday == 2 && dt.hour > 12 && dt.hour < 22) {
						var maintenanceMessage = '\n\n***Steam has weekly maintenance every Tuesday evening.\nPlease check [Steam Status](https://steamstat.us/) for updates.***';
					} else {
						var maintenanceMessage = '';
					}

					const origin = data['Origin_login'];
					const apex = data['ApexOauth_Crossplay'];
					const accounts = data['EA_accounts'];
					const novafusion = data['EA_novafusion'];

					var annoText = `No announcements at this time.${maintenanceMessage}`;

					const statusAmount = checkStatus(origin) + checkStatus(apex) + checkStatus(accounts) + checkStatus(novafusion);

					// if (annoCheck(anno.Release, anno.Duration) == true) {
					// 	var embedColor = 'F04747';
					// } else {
					if (statusAmount <= 4) {
						var embedColor = '43B581';
					} else if (statusAmount <= 10) {
						var embedColor = 'FAA61A';
					} else {
						var embedColor = 'F04747';
					}
					// }

					const statusEmbed = new EmbedBuilder()
						.setTitle('Apex Legends Server Status')
						.setDescription(`**Announcements**\n${annoText}\n\n**Last Updated: <t:${Math.floor(Date.now() / 1000)}:R>**`)
						.addFields([
							{ name: '[Crossplay] Apex Login', value: statusLayout(apex), inline: true },
							{ name: 'EA Login', value: statusLayout(origin), inline: true },
							{ name: '\u200b', value: `\u200b`, inline: true },
							{ name: 'EA Accounts', value: statusLayout(accounts), inline: true },
							{ name: 'Lobby & Matchmaking Services', value: statusLayout(novafusion), inline: true },
							{ name: '\u200b', value: `\u200b`, inline: true },
						])
						.setColor(embedColor)
						.setFooter({
							text: `Status data provided by https://apexlegendsstatus.com/.\nServer status may not always be indicative of your ability to play.`,
						})
						.setTimestamp();

					const guild = client.guilds.cache.get(process.env.SERVER_ID);
					if (!guild) return console.log('Guild not available.');

					const channel = guild.channels.cache.find(c => c.id === process.env.CHANNEL_ID);
					if (!channel) return console.log('Channel not available.');

					try {
						// Update Message Embed
						const message = channel.messages.fetch(process.env.MESSAGE_ID);
						if (!message) return console.log('Message not available.');

						channel.messages.fetch(process.env.MESSAGE_ID).then(msg => {
							msg.edit({ embeds: [statusEmbed] });
						});

						console.log(chalk.green(`${chalk.bold('[BOT]')} Updated server status embed`));

						// if (annoCheck(anno.Release, anno.Duration) == true) {
						// 	var channelIcon = '🔴';
						// } else {
						if (statusAmount <= 4) {
							var channelIcon = '🟢';
						} else if (statusAmount <= 10) {
							var channelIcon = '🟡';
						} else {
							var channelIcon = '🔴';
						}
						// }

						const newDate = new Date();

						if (newDate.getMinutes() % 10 === 0) {
							// Update Channel Name
							channel.setName(`${channelIcon}-game-status`);

							console.log(chalk.green(`${chalk.bold('[BOT]')} Updated channel status indicator`));
						} else {
							// Do not update channel name
						}
					} catch (err) {
						console.log(err);
					}
				}

				now = new Date();
				var delay = 60000 - (now % 60000);
				setTimeout(loop, delay);
				console.log(chalk.yellow(`${chalk.bold('[BOT]')} Checking status rotation...`));
			})();
		}

		updateStatus();
	},
};
