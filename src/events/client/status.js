const { ActivityType, EmbedBuilder } = require('discord.js');
const axios = require('axios');

const { status } = require('../../config.json');
const { serverStatus } = require('../../data/emotes.json');

module.exports = {
	name: 'ready',
	once: false,
	execute(client) {
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

			if (status.enabled == false) return console.log('Status Updates have been disabled.');

			(function loop() {
				if (new Date().getMinutes() % status.interval == 0) {
					let serverStatus = `https://api.mozambiquehe.re/servers?auth=${status.api}`;
					const one = axios.get(serverStatus);

					let announcements = `https://apexlegendsstatus.com/anno.json`;
					const two = axios.get(announcements);

					axios.all([one, two]).then(
						axios.spread((...responses) => {
							const data = responses[0].data;
							const anno = responses[1].data;

							const origin = data['Origin_login'];
							const apex = data['ApexOauth_Crossplay'];
							const accounts = data['EA_accounts'];
							const novafusion = data['EA_novafusion'];

							var annoText = annoCheck(anno.Release, anno.Duration) === true ? anno.Content : `No announcements at this time.`;

							const statusAmount = checkStatus(origin) + checkStatus(apex) + checkStatus(accounts) + checkStatus(novafusion);

							if (annoCheck(anno.Release, anno.Duration) == true) {
								var embedColor = 'F04747';
							} else {
								if (statusAmount <= 4) {
									var embedColor = '43B581';
								} else if (statusAmount <= 10) {
									var embedColor = 'FAA61A';
								} else {
									var embedColor = 'F04747';
								}
							}

							const statusEmbed = new EmbedBuilder()
								.setTitle('Apex Legends Server Status')
								.setDescription(`**Announcements**\n${annoText}`)
								.addFields([
									{ name: '[Crossplay] Apex Login', value: statusLayout(apex), inline: true },
									{ name: 'Origin Login', value: statusLayout(origin), inline: true },
									{ name: '\u200b', value: `\u200b`, inline: true },
									{ name: 'EA Accounts', value: statusLayout(accounts), inline: true },
									{ name: 'Lobby & Matchmaking Services', value: statusLayout(novafusion), inline: true },
									{ name: '\u200b', value: `\u200b`, inline: true },
								])
								.setColor(embedColor)
								.setFooter({
									text: 'Status data provided by https://apexlegendsstatus.com/',
								})
								.setTimestamp();

							const guild = client.guilds.cache.get(status.server);
							if (!guild) return console.log('Guild not available.');

							const channel = guild.channels.cache.find(c => c.id === status.channel);
							if (!channel) return console.log('Channel not available.');

							try {
								// Update Message Embed
								const message = channel.messages.fetch(status.message);
								if (!message) return console.log('Message not available.');

								channel.messages.fetch(status.message).then(msg => {
									msg.edit({ embeds: [statusEmbed] });
								});

								console.log('Updated server status embed.');

								if (annoCheck(anno.Release, anno.Duration) == true) {
									var channelIcon = '🔴';
								} else {
									if (statusAmount <= 4) {
										var channelIcon = '🟢';
									} else if (statusAmount <= 10) {
										var channelIcon = '🟡';
									} else {
										var channelIcon = '🔴';
									}
								}

								const newDate = new Date();

								if (newDate.getMinutes() % 5 === 0) {
									// Update Channel Name
									channel.setName(`${channelIcon}-game-status`);

									console.log('Updated channel name.');
								} else {
									// Do not update channel name
								}
							} catch (err) {
								console.log(err);
							}
						}),
					);
				}

				now = new Date();
				var delay = 60000 - (now % 60000);
				setTimeout(loop, delay);
				console.log('Checking status rotation...');
			})();
		}

		updateStatus();
	},
};
