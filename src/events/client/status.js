const chalk = require('chalk');
const axios = require('axios');
const { DateTime } = require('luxon');
const { EmbedBuilder } = require('discord.js');

const { emoteType, checkStatus, formatStatus, maintenanceCheck, announcementCheck } = require('../../utils.js');

const wait = n => new Promise(resolve => setTimeout(resolve, n));

module.exports = {
	name: 'clientReady',
	once: true,
	execute(client) {
		if (Bun.env.ENABLED == 'false') return;

		async function updateStatus() {
			// get javascript current unix timestamp
			const now = Date.now();
			const minute = new Date(now).getMinutes();

			// if minute is divisible by 5, continue
			if (minute % Bun.env.INTERVAL != 0) return;

			const statusURL = axios.get(`https://api.mozambiquehe.re/servers?auth=${Bun.env.ALS_API}`);
			const announcementURL = axios.get(`http://solaris.apexstats.dev/repulsor/announcements`);

			await axios
				.all([statusURL, announcementURL])
				.then(
					axios.spread((...res) => {
						const statusData = res[0].data;
						const announcementData = res[1].data;

						const eaApp = statusData['Origin_login'];
						const crossplay = statusData['ApexOauth_Crossplay'];
						const eaAccounts = statusData['EA_accounts'];
						const novaFusion = statusData['EA_novafusion'];
						const consoles = statusData['otherPlatforms'];

						function embedColor() {
							const statusCount = checkStatus(eaApp) + checkStatus(crossplay) + checkStatus(eaAccounts) + checkStatus(novaFusion);

							if (announcementData.times.start < Math.floor(DateTime.now().toSeconds()) && announcementData.times.end > Math.floor(DateTime.now().toSeconds()))
								return 'FAA61A';

							if (statusCount <= 4) return '43B581';
							if (statusCount <= 10) return 'FAA61A';

							return 'F04747';
						}

						if (announcementData.times.start < Math.floor(DateTime.now().toSeconds()) && announcementData.times.end > Math.floor(DateTime.now().toSeconds())) {
							announcementActive = 1;
						} else {
							announcementActive = 0;
						}

						const statusEmbed = new EmbedBuilder()
							.setTitle('Apex Legends Server Status')
							.setDescription(`**Announcements**\n${announcementCheck(announcementData)}${maintenanceCheck()}\n**Last Updated:** <t:${Math.floor(now / 1000)}:R>`)
							.addFields([
								{
									name: 'Console Services',
									value: `${emoteType(consoles['Xbox-Live']['Status'])} **Xbox Live:** ${consoles['Xbox-Live']['Status']}`,
									inline: true,
								},
								{
									name: '\u200b',
									value: `${emoteType(consoles['Playstation-Network']['Status'])} **PlayStation Network:** ${consoles['Playstation-Network']['Status']}`,
									inline: true,
								},
								{
									name: '\u200b',
									value: `\u200b`,
									inline: true,
								},
								{
									name: '[Crossplay] Apex Login',
									value: `${formatStatus(crossplay, announcementActive)}`,
									inline: true,
								},
								{
									name: 'EA Login',
									value: `${formatStatus(eaApp, announcementActive)}`,
									inline: true,
								},
								{
									name: '\u200b',
									value: `\u200b`,
									inline: true,
								},
								{
									name: 'EA Accounts',
									value: `${formatStatus(eaAccounts, announcementActive)}`,
									inline: true,
								},
								{
									name: 'Lobby & Matchmaking Services',
									value: `${formatStatus(novaFusion, announcementActive)}`,
									inline: true,
								},
								{
									name: '\u200b',
									value: `\u200b`,
									inline: true,
								},
							])
							.setFooter({ text: `Status data provided by https://apexlegendsstatus.com/.\nServer status may not always be indicative of your ability to play.` })
							.setColor(embedColor())
							.setTimestamp();

						const guild = client.guilds.cache.get(Bun.env.SERVER_ID);
						const channel = guild.channels.cache.get(Bun.env.CHANNEL_ID);

						channel.messages.fetch(Bun.env.MESSAGE_ID).then(msg => {
							msg.edit({
								content: '',
								embeds: [statusEmbed],
								components: [
									{
										type: 1,
										components: [
											{
												type: 2,
												style: 5,
												label: 'Report Server Issues',
												url: 'http://apexlegendsstatus.com/?ref=sdcat',
											},
											{
												type: 2,
												style: 5,
												label: 'Apex Dev Tracker',
												url: 'https://trello.com/b/ZVrHV38P/apex-tracker',
											},
										],
									},
								],
							});
						});

						const newDate = new Date();

						function channelIcon() {
							const statusCount = checkStatus(eaApp) + checkStatus(crossplay) + checkStatus(eaAccounts) + checkStatus(novaFusion);

							if (announcementData.times.start < Math.floor(DateTime.now().toSeconds()) && announcementData.times.end > Math.floor(DateTime.now().toSeconds()))
								return '🟡';

							if (statusCount <= 4) return '🟢';
							if (statusCount <= 10) return '🟡';

							return '🔴';
						}

						if (newDate.getMinutes() % 10 === 0) {
							channel.setName(`${channelIcon()}-server-status`);

							console.log(chalk.blue(`${chalk.bold(`[BOT]`)} Updated channel status indicator`));
						}

						console.log(chalk.blue(`${chalk.bold(`[BOT]`)} Server status embed updated`));

						setTimeout(updateStatus, 60000);
					}),
				)
				.catch(async error => {
					if (error.response) {
						console.log(chalk.yellow(`${chalk.bold('[Status Lookup Error]')} ${error.response.data.errorShort}`));

						await wait(5000);

						updateStatus();
					} else if (error.request) {
						console.log(error.request);

						await wait(5000);

						updateStatus();
					} else {
						console.log(error.message);

						await wait(5000);

						updateStatus();
					}
				});
		}

		updateStatus();
	},
};
