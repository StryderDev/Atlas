const { MessageEmbed } = require("discord.js");

module.exports.run = (client, message, args) => {
	if (message.author.id != "360564818123554836") return;

	const template = new MessageEmbed()
		.setTitle("Embed Template")
		.setDescription("This module will be updated once it is configured.");

	message.channel.send({ embeds: [template] });
};
