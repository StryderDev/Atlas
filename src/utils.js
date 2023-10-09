function emoteType(status) {
	if (status == 'UP') return 'U';
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

module.exports = { formatStatus };
