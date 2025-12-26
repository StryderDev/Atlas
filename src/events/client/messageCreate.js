const chalk = require('chalk');
const { DateTime } = require('luxon');
const { Database } = require('bun:sqlite');
const { doesUserHaveSlowmode } = require('../../utils.js');
const { MessageFlags, ButtonBuilder, ActionRowBuilder, ContainerBuilder, TextDisplayBuilder } = require('discord.js');

const db_ModPingData = new Database(`${__dirname}/../../database/modPingData.sqlite`);

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

		await doesUserHaveSlowmode(message);

		try {
			const checkUserSlowmode = db_ModPingData.query('SELECT timestamp FROM modPing_Cooldown WHERE userID = ?1').get(message.author.id);

			if (checkUserSlowmode != null) {
				if (checkUserSlowmode.timestamp + parseInt(Bun.env.COOLDOWN_TIME) > Math.floor(DateTime.now().toSeconds())) return;
			}

			try {
				db_ModPingData
					.prepare(`INSERT INTO modPing_Cooldown (userID, timestamp) VALUES (?1, ?2) ON CONFLICT(userID) DO UPDATE SET timestamp = excluded.timestamp`)
					.run(message.author.id, Math.floor(DateTime.now().toSeconds()));

				console.log(`${chalk.bold.green('[ATLAS_MOD-PING]')} Added/Updated Ping Cooldown for ${chalk.cyan(message.author.username)}`);

				const modPingContainer = new ContainerBuilder();

				const modPingText = new TextDisplayBuilder().setContent(
					`# :warning: Are you sure you want to ping staff?\n- Staff pings should only be used **for emergencies**\n- Server staff **__DO NOT__** work for EA or Respawn\n  - They **__cannot__** help with game or account related issues\n- You will be warned, muted, or banned if you abuse staff pings\n\nIf it's not an emergency, please DM <@542736472155881473>\n\n-# This message will be deleted automagically if there is no response`,
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
					const channel = message.guild.channels.cache.get(message.channel.id);

					const noReplyContainer = new ContainerBuilder();

					const noReplyText = new TextDisplayBuilder().setContent(`no reply :/`);

					noReplyContainer.addTextDisplayComponents(noReplyText);

					setTimeout(() => {
						msg.edit({ components: [noReplyContainer], flags: MessageFlags.IsComponentsV2 });
					}, 10000);
				});
			} catch (err) {
				console.log(`${chalk.bold.red('[ATLAS_MOD-PING]')} Query error when updating Ping Cooldown: ${chalk.red(err)}`);
			}
		} catch (err) {
			console.log(`${chalk.bold.red('[ATLAS_MOD-PING]')} Query error when checking Ping Cooldown: ${chalk.red(err)}`);
		}
	},
};
