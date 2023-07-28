// Pergunta do Dia Bot v0.5.0 - criado pelo Enzo da Órbita da Jogatina
// Código adaptado do discord.js Guide (https://discordjs.guide)

'use strict';

const fs = require('fs');
const botWeb = require('express')();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = require('@supabase/supabase-js');
const database = supabase.createClient('https://onlntxblavzgsutdbson.supabase.co', process.env.SUPABASE_TOKEN);

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [
    Partials.Channel
  ]
});

global.bot = bot;
global.database = database;

require('./core/commandsCore').deployCommands();
require('./core/eventsCore').deployEvents();

process.on('unhandledRejection', (reason, promise) => console.error(reason, promise));
process.on('uncaughtException', (reason, origin) => console.error(reason, origin));

botWeb.get('/', (req, res) => { 
  res.send('❔📆🥰 - Pergunta do Dia no ar!');
});

botWeb.listen(3000);
bot.login(process.env.DISCORD_TOKEN);