"use strict";

const { Client, GatewayIntentBits, Partials, Options } = require("discord.js");

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
  sweepers: {
    ...Options.DefaultSweeperSettings,
    messages: {
			interval: 1800,
			lifetime: 900,
		}
  }
});

async function initializeBot() {
  global.bot = bot;
  require('../core/commandsCore').deployCommands();
  require('../core/eventsCore').deployEvents();
  await bot.login(process.env.DISCORD_TOKEN);
  global.admins = await getAdmins(bot);
}

async function getAdmins(bot) {
  const adminGuild = await bot.guilds.fetch(process.env.ADMIN_GUILD_ID);
  const members = await adminGuild.members.fetch();
  return [
    "668199172276748328",
    ...members
      .filter((m) => m.roles.cache.has(process.env.ADMIN_ROLE_ID))
      .map((m) => m.id),
  ];
}

module.exports = { initializeBot, getAdmins };