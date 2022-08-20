# Apex Legends Status Rotation

A discord bot to display the current server status for Apex Legends, updating automatically on a set interval. Requires Node 14 and D.JS 13.

# Setup

1. Set up a bot at https://discordapp.com/developers/applications, make sure it has the "Messages" Privileged Gateway Intent enabled
2. Install Node 14+
3. Clone this repo, enter the directory, and run `npm ci`
4. Make a copy of config.json.example and rename it to config.json
5. Fill in the following values
    - prefix: Used to set the template message that bot uses to display the server status
    - owner: Your Discord User ID
    - token: Your bot token
    - api -> apex: The Apex Legends Status API key (https://portal.apexlegendsapi.com/)
      Leave the rest of the fields blank until after the next step
6. Run `node Rotation.js` (or use your favourite process manager such as pm2) to start the bot
7. Find the channel you want the bot to post in, and type `!template` (replace `!` with your prefix)
8. Copy the ID of the message and channel the bot is in, as well as the ID of the server, and place those values in the appropriate places in the config
9. Restart your bot, and it should automatically update once a minute by default
