const { client } = require('../Rotation.js');
const { version } = require('../package.json');

client.once('ready', client => {
	console.log(`Logging in to ${client.user.username}...`);
	console.log(`Logged in to ${client.user.username}!`);

	client.user.setPresence({ activities: [{ name: 'the Apex Games', type: 'WATCHING' }] }, { status: 'online' });
});
