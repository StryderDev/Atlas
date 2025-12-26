const chalk = require('chalk');
const db = require('./database.js');
const { DateTime } = require('luxon');
const { Database } = require('bun:sqlite');

function checkEntryPlural(amount, string) {
	if (amount == 1) return `${string}y`;

	return `${string}ies`;
}

function emoteType(status, type) {
	if (type == 1) return Bun.env.EMOTE_SLOW !== false && Bun.env.EMOTE_SLOW !== '' ? Bun.env.EMOTE_SLOW : '🟡';

	if (status == 'UP') return Bun.env.EMOTE_UP !== false && Bun.env.EMOTE_UP !== '' ? Bun.env.EMOTE_UP : '🟢';

	if (status == 'SLOW') return Bun.env.EMOTE_SLOW !== false && Bun.env.EMOTE_SLOW !== '' ? Bun.env.EMOTE_SLOW : '🟡';

	if (status == 'DOWN') return Bun.env.EMOTE_DOWN !== false && Bun.env.EMOTE_DOWN !== '' ? Bun.env.EMOTE_DOWN : '🔴';
}

function checkStatus(status) {
	var EUWest;
	var EUEast;
	var USWest;
	var USEast;
	var USCentral;
	var SouthAmerica;
	var Asia;

	if (status['EU-West'].Status == 'UP') {
		EUWest = 0;
	} else if (status['EU-West'].Status == 'SLOW') {
		EUWest = 1;
	} else {
		EUWest = 3;
	}

	if (status['EU-East'].Status == 'UP') {
		EUEast = 0;
	} else if (status['EU-East'].Status == 'SLOW') {
		EUEast = 1;
	} else {
		EUEast = 3;
	}

	if (status['US-West'].Status == 'UP') {
		USWest = 0;
	} else if (status['US-West'].Status == 'SLOW') {
		USWest = 1;
	} else {
		USWest = 3;
	}

	if (status['US-East'].Status == 'UP') {
		USEast = 0;
	} else if (status['US-East'].Status == 'SLOW') {
		USEast = 1;
	} else {
		USEast = 3;
	}

	if (status['US-Central'].Status == 'UP') {
		USCentral = 0;
	} else if (status['US-Central'].Status == 'SLOW') {
		USCentral = 1;
	} else {
		USCentral = 3;
	}

	if (status['SouthAmerica'].Status == 'UP') {
		SouthAmerica = 0;
	} else if (status['SouthAmerica'].Status == 'SLOW') {
		SouthAmerica = 1;
	} else {
		SouthAmerica = 3;
	}

	if (status['Asia'].Status == 'UP') {
		Asia = 0;
	} else if (status['Asia'].Status == 'SLOW') {
		Asia = 1;
	} else {
		Asia = 3;
	}

	return EUWest + EUEast + USWest + USEast + USCentral + SouthAmerica + Asia;
}

function formatStatus(service, status) {
	return `${emoteType(service['US-East']['Status'], status)} **US East:** ${service['US-East']['ResponseTime']}ms\n${emoteType(
		service['US-Central']['Status'],
		status,
	)} **US Central:** ${service['US-Central']['ResponseTime']}ms\n${emoteType(service['US-West']['Status'], status)} **US West:** ${
		service['US-West']['ResponseTime']
	}ms\n${emoteType(service['EU-East']['Status'], status)} **EU East:** ${service['EU-East']['ResponseTime']}ms\n${emoteType(service['EU-West']['Status'], status)} **EU West:** ${
		service['EU-West']['ResponseTime']
	}ms\n${emoteType(service['SouthAmerica']['Status'], status)} **South America:** ${service['SouthAmerica']['ResponseTime']}ms\n${emoteType(
		service['Asia']['Status'],
		status,
	)} **Asia:** ${service['Asia']['ResponseTime']}ms`;
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
	return console.log('bread');
}

module.exports = { emoteType, checkStatus, formatStatus, checkEntryPlural, maintenanceCheck, announcementCheck, doesUserHaveSlowmode };
