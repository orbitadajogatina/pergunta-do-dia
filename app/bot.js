"use strict";

const { Client, GatewayIntentBits, Partials } = require("discord.js");
const { deployCommands } = require("../core/commandsCore");
const { deployEvents } = require("../core/eventsCore");
const { getAdmins } = require("../utils/apiAuthorization");

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

async function initializeBot() {
  deployCommands();
  deployEvents();
  await bot.login(process.env.DISCORD_TOKEN);
  global.bot = bot;
  global.admins = await getAdmins(bot);
}

module.exports = { initializeBot };