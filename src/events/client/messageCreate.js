const chalk = require('chalk');
const { DateTime } = require('luxon');
const dbConnection = require('../../database.js');
const { doesUserHaveSlowmode } = require('../../utils.js');
const { MessageFlags, ButtonBuilder, ActionRowBuilder, ContainerBuilder, TextDisplayBuilder } = require('discord.js');

module.exports = {
	name: 'messageCreate',
	once: false,
	async execute(message) {
		if (message.author.bot) return;

		if (message.mentions.roles.size == 0) return;
		if (message.mentions.roles.first().id != Bun.env.DISCORD_MOD_PING_ROLE_ID) return;

		const messageContent = message.content
			.replace(/<@&[0-9]+>/g, '')
			.replace(/\s+/g, ' ')
			.trim();

		if (!messageContent) {
			const noMessageContainer = new ContainerBuilder();

			const versionText = new TextDisplayBuilder().setContent(
				`## Please provide a message with your ping to notify staff.\nResend the ping with a message to try again.\n\n-# This message will be deleted shortly.`,
			);

			noMessageContainer.addTextDisplayComponents(versionText);

			message.reply({ components: [noMessageContainer], flags: MessageFlags.IsComponentsV2 }).then(msg => {
				setTimeout(() => {
					msg.delete();
					message.delete();
				}, 7500);
			});

			return;
		}

		await doesUserHaveSlowmode(message)
			.then(async slowmodeResult => {
				if (slowmodeResult) return;

				const checkUserSlowmode = await dbConnection`SELECT timestamp FROM atlas_mod_ping_cooldown WHERE user_id = ${message.author.id}`;

				if (checkUserSlowmode != null) {
					if (checkUserSlowmode.timestamp + parseInt(Bun.env.COOLDOWN_TIME) > Math.floor(DateTime.now().toSeconds())) return;
				}

				await dbConnection`INSERT INTO atlas_mod_ping_cooldown (user_id, timestamp) VALUES (${message.author.id}, ${Math.floor(DateTime.now().toSeconds())}) ON CONFLICT(user_id) DO UPDATE SET timestamp = excluded.timestamp`.catch(
					err => console.log(`${chalk.red.bold('[ATLAS_MOD-PING]')} Query error when updating Ping Cooldown: ${chalk.red(err)}`),
				);

				await dbConnection`INSERT INTO atlas_mod_ping_message_data (message_id, user_id, message_text, timestamp) VALUES (${message.id}, ${message.author.id}, ${messageContent}, ${Math.floor(DateTime.now().toSeconds())})`.catch(
					err => console.log(`${chalk.red.bold('[ATLAS_MOD-PING]')} Query error when inserting Ping Message Data: ${chalk.red(err)}`),
				);

				console.log(`${chalk.bold.green('[ATLAS_MOD-PING]')} Added/Updated Ping Cooldown and Message Data for ${chalk.cyan(message.author.username)}`);

				const modPingContainer = new ContainerBuilder();

				const modPingText = new TextDisplayBuilder().setContent(
					`# :warning: Are you sure you want to ping staff?\n- Staff pings should only be used **for emergencies**\n- Server staff **__DO NOT__** work for EA or Respawn\n  - They **__cannot__** help with game or account related issues\n- You will be warned, muted, or banned if you abuse staff pings\n\nIf it's not an emergency, please DM <@542736472155881473>\n-# This message will be deleted automagically if there is no response`,
				);

				const modPingYes = new ButtonBuilder()
					.setCustomId(`${message.id}-${message.author.id}-yes`)
					.setLabel("Yes, it's an emergency!")
					.setStyle('Success')
					.setEmoji(`<:Atlas_Yes:1190556000550408233>`);
				const modPingNo = new ButtonBuilder()
					.setCustomId(`${message.id}-${message.author.id}-no`)
					.setLabel("Nevermind, I'll message ModMail.")
					.setStyle('Danger')
					.setEmoji(`<:Atlas_No:1190555998860095590>`);

				modPingContainer.addTextDisplayComponents(modPingText);

				const buttonRow = new ActionRowBuilder().addComponents(modPingYes, modPingNo);

				message.reply({ components: [modPingContainer, buttonRow], flags: MessageFlags.IsComponentsV2 }).then(msg => {
					const noReplyContainer = new ContainerBuilder();

					const noReplyText = new TextDisplayBuilder().setContent(`No response was received, canceling staff ping and initiating cleanup...`);

					noReplyContainer.addTextDisplayComponents(noReplyText);

					setTimeout(() => {
						msg.edit({ components: [noReplyContainer], flags: MessageFlags.IsComponentsV2 }).catch(err => {
							if (err.code === 10008) {
								console.log(`${chalk.yellow.bold('[ATLAS_MOD-PING]')} Message was already deleted`);
							} else {
								console.log(`${chalk.red.bold('[ATLAS_MOD-PING]')} Uncaught Error: ${err}`);
							}
						});

						setTimeout(() => {
							message.delete().catch(err => {
								if (err.code === 10008) {
									console.log(`${chalk.yellow.bold('[ATLAS_MOD-PING]')} Message was already deleted`);
								} else {
									console.log(`${chalk.red.bold('[ATLAS_MOD-PING]')} Uncaught Error: ${err}`);
								}
							});

							msg.delete().catch(err => {
								if (err.code === 10008) {
									console.log(`${chalk.yellow.bold('[ATLAS_MOD-PING]')} Message was already deleted`);
								} else {
									console.log(`${chalk.red.bold('[ATLAS_MOD-PING]')} Uncaught Error: ${err}`);
								}
							});
						}, 5000);
					}, 15000);
				});
			})
			.catch(err => {
				if (err.code === 10008) {
					console.log(`${chalk.yellow.bold('[ATLAS_MOD-PING]')} Message was already deleted`);
				} else {
					console.log(`${chalk.red.bold('[ATLAS_MOD-PING]')} Uncaught Error: ${err}`);
				}
			});
	},
};
