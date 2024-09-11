const chalk = require('chalk');
const db = require('./database.js');
const { DateTime } = require('luxon');

function checkEntryPlural(amount, string) {
	if (amount == 1) return `${string}y`;

	return `${string}ies`;
}

function emoteType(status) {
	if (status == 'UP') return process.env.EMOTE_UP !== false && process.env.EMOTE_UP !== '' ? process.env.EMOTE_UP : '🟢';

	if (status == 'SLOW') return process.env.EMOTE_SLOW !== false && process.env.EMOTE_SLOW !== '' ? process.env.EMOTE_SLOW : '🟡';

	if (status == 'DOWN') return process.env.EMOTE_DOWN !== false && process.env.EMOTE_DOWN !== '' ? process.env.EMOTE_DOWN : '🔴';
}

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

function formatStatus(service) {
	return `${emoteType(service['US-East']['Status'])} **US East:** ${service['US-East']['ResponseTime']}ms\n${emoteType(service['US-Central']['Status'])} **US Central:** ${
		service['US-Central']['ResponseTime']
	}ms\n${emoteType(service['US-West']['Status'])} **US West:** ${service['US-West']['ResponseTime']}ms\n${emoteType(service['EU-East']['Status'])} **EU East:** ${
		service['EU-East']['ResponseTime']
	}ms\n${emoteType(service['EU-West']['Status'])} **EU West:** ${service['EU-West']['ResponseTime']}ms\n${emoteType(service['SouthAmerica']['Status'])} **South America:** ${
		service['SouthAmerica']['ResponseTime']
	}ms\n${emoteType(service['Asia']['Status'])} **Asia:** ${service['Asia']['ResponseTime']}ms`;
}

function maintenanceCheck() {
	const dt = DateTime.now().setZone('America/Chicago');

	if (dt.weekday === 2 && dt.hour > 12 && dt.hour < 22)
		return '\n***Steam has weekly maintenance every Tuesday evening.\nPlease check [Steam Status](https://steamstat.us/) for updates.***\n';

	return '';
}

function announcementCheck(data) {
	if (data.enabled == 0) return '*N/A*\n';

	if (data.times.start > Math.floor(DateTime.now().toSeconds())) return '*N/A*\n';
	if (data.times.end < Math.floor(DateTime.now().toSeconds())) return '*N/A*\n';

	return `${data.text}\n\n-# (Alert expires <t:${data.times.end}:R>)\n`;
}

function doesUserHaveSlowmode(message) {
	let slowmodeQuery = 'SELECT userID,timestamp FROM pingCooldown WHERE userID = ?';

	const currentTime = Math.floor(DateTime.now().toSeconds());
	const messageTime = Math.floor(message.createdTimestamp / 1000);

	db.query(slowmodeQuery, [message.author.id], (err, slowmodeRow) => {
		if (slowmodeRow.length != 0) {
			if (slowmodeRow[0].timestamp + parseInt(process.env.COOLDOWN_TIME) > currentTime) {
				message.reply(`You are currently on cooldown, which will end <t:${slowmodeRow[0].timestamp + parseInt(process.env.COOLDOWN_TIME)}:R>.`).then(msg => {
					setTimeout(() => {
						message.delete();
						msg.delete();
					}, 10000);
				});

				return;
			} else {
				const updateSlowmode = `UPDATE pingCooldown SET timestamp = ? WHERE userID = ?`;

				db.query(updateSlowmode, [messageTime, message.author.id], (err, updateSlowmodeRow) => {
					if (err) {
						console.log(chalk.red(`${chalk.bold(`[REAPER]`)} ${err}`));
						return false;
					}

					console.log(chalk.green(`${chalk.bold(`[REAPER]`)} Updated slowmode row for ${message.author.tag}`));
				});
			}
		} else {
			const insertSlowmode = `INSERT INTO pingCooldown (userID, timestamp) VALUES (?, ?)`;

			db.query(insertSlowmode, [message.author.id, messageTime], (err, insertSlowmodeRow) => {
				if (err) {
					console.log(chalk.red(`${chalk.bold(`[REAPER]`)} ${err}`));
					return false;
				}

				console.log(chalk.green(`${chalk.bold(`[REAPER]`)} Inserted slowmode row for ${message.author.tag}`));
			});
		}
	});
}

module.exports = { emoteType, checkStatus, formatStatus, checkEntryPlural, maintenanceCheck, announcementCheck, doesUserHaveSlowmode };
