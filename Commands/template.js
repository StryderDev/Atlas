const { MessageEmbed } = require('discord.js');

const { discord } = require('../config.json');

module.exports.run = (client, message, args) => {
	if (message.author.id != discord.owner) return;

	const template = new MessageEmbed().setTitle('Embed Template').setDescription('This module will be updated once it is configured.');

	message.channel.send({ embeds: [template] });
};
