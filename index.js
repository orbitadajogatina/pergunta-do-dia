// Pergunta do Dia Bot 1.1.1 - criado pelo Enzo da Órbita da Jogatina
// Código adaptado do discord.js Guide (https://discordjs.guide)

'use strict';

const fs = require('fs');
const express = require('express');
const botWeb = express();
const cookieParser = require('cookie-parser');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

// DATABASE
const supabase = require('@supabase/supabase-js');
const database = supabase.createClient('https://onlntxblavzgsutdbson.supabase.co', process.env.SUPABASE_TOKEN);
global.database = database;

// BOT
const { Client, GatewayIntentBits, Partials } = require('discord.js');
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
async function getAdmins() {
  const adminGuild = await bot.guilds.fetch(process.env.ADMIN_GUILD_ID);
  const membersWithRole = await adminGuild.members.fetch({withPresences: false}).then(members => members.filter(member => member.roles.cache.has(process.env.ADMIN_ROLE_ID)));
  return ['668199172276748328', ...membersWithRole.map(e => e.id)];
}
global.getAdmins = getAdmins;

require('./core/commandsCore').deployCommands();
require('./core/eventsCore').deployEvents();
bot.login(process.env.DISCORD_TOKEN).then(async () => global.admins = await getAdmins());

// SITE
botWeb.use(cookieParser());
botWeb.get('/', (req, res) => {
  res.send('❔📆🥰 - Pergunta do Dia no ar!<br><br>Confira o bacaníssimo cliente web oficial em: - ainda tá sendo desenvolvido -');
});

// API
botWeb.use(express.json());

async function apiAuthorization(authorizationToken) {
  if (!authorizationToken) return false;
    
  const {data} = await database.from('api').select().eq('token', authorizationToken).single();
  if (data?.suspended) return 'suspended';
  if (!data) return false;

  await database.from('api').update({uses: data.uses + 1, last_use: new Date()}).eq('token', data.token);
  return data;
}

async function resolveEndpoint(req, res, param, method) {
  const modulePath = path.resolve(__dirname, 'api', param.replace('/', ''));
  if (!fs.existsSync(modulePath + '.js')) {
    res.status(404).send(`Invalid endpoint: ${param}`);
    return;
  }

  const authorization = await apiAuthorization(req.get("Authorization").match(/Bearer (.*)/)?.[1]);
  if (authorization == false) {
    res.status(401).send(`Invalid token. Please get your API key on Discord using the bot or through the website.`);
    return;
  } else if (authorization == 'suspended') {
    res.status(403).send(`You are suspended. Please contact Enzo.`);
    return;
  }

  try {
    const apiModule = require(modulePath + '.js');
    if (typeof apiModule[method] === 'function') {
      const result = await apiModule[method](req, res, authorization);
      res.json(result);
    } else {
      res.status(404).send(`${method.toUpperCase()} endpoint not available for this endpoint: ${param}`);
    }
  } catch (error) {
    console.error('Error loading module:', param, error);
    res.status(error.status || 500).send(`Error: ${error.message}`);
  }
}

botWeb.get('/api/', async (req, res) => {
  res.status(200).send(`No momento, a única forma de obter uma chave da API é utilizando o comando /token pelo bot no Discord. Observe que, se você já tem uma chave, utilizar o comando te trará uma nova chave e fará a antiga ser inutilizável.`);
});

botWeb.get('/api/v1/question', async (req, res) => {
  res.status(400).send(`Missing id`);
});

botWeb.get('/api/v1/question/:id', async (req, res) => {
  const authorization = await apiAuthorization(req.get("Authorization").match(/Bearer (.*)/)?.[1]);
  if (authorization == false) {
    res.status(401).send(`Invalid token. Please get your API key on Discord using the bot or through the website.`);
    return;
  } else if (authorization == 'suspended') {
    res.status(403).send(`You are suspended. Please contact Enzo.`);
    return;
  }

  const questionAPIModule = require('./api/question');
  try {
    const result = await questionAPIModule.get(req, res, authorization);
    res.json(result);
  } catch (error) {
    console.error('Error loading module:', '/question/:id', error);
    res.status(error.status || 500).send(`Error: ${error.message}`);
  }
});

botWeb.get('/api/v1/*', async (req, res) => {
  const param = req.params[0];
  resolveEndpoint(req, res, param, 'get');
});

botWeb.post('/api/v1/*', (req, res) => {
  const param = req.params[0];
  resolveEndpoint(req, res, param, 'post');
});

botWeb.patch('/api/v1/question', async (req, res) => {
  res.status(400).send(`Missing id`);
});

botWeb.patch('/api/v1/question/:id', async (req, res) => {
  const authorization = await apiAuthorization(req.get("Authorization").match(/Bearer (.*)/)?.[1]);
  if (authorization == false) {
    res.status(401).send(`Invalid token. Please get your API key on Discord using the bot or through the website.`);
    return;
  } else if (authorization == 'suspended') {
    res.status(403).send(`You are suspended. Please contact Enzo.`);
    return;
  }

  const questionAPIModule = require('./api/question');
  try {
    const result = await questionAPIModule.patch(req, res, authorization);
    res.json(result);
  } catch (error) {
    console.error('Error loading module:', '/question/:id', error);
    res.status(error.status || 500).send(`Error: ${error.message}`);
  }
});

botWeb.delete('/api/v1/question', async (req, res) => {
  res.status(400).send(`Missing id`);
});

botWeb.delete('/api/v1/question/:id', async (req, res) => {
  const authorization = await apiAuthorization(req.get("Authorization").match(/Bearer (.*)/)?.[1]);
  if (authorization == false) {
    res.status(401).send(`Invalid token. Please get your API key on Discord using the bot or through the website.`);
    return;
  } else if (authorization == 'suspended') {
    res.status(403).send(`You are suspended. Please contact Enzo.`);
    return;
  }

  const questionAPIModule = require('./api/question');
  try {
    const result = await questionAPIModule.del(req, res, authorization);
    res.json(result);
  } catch (error) {
    console.error('Error loading module:', '/question/:id', error);
    res.status(error.status || 500).send(`Error: ${error.message}`);
  }
});

botWeb.delete('/api/v1/*', (req, res) => {
  const param = req.params[0];
  resolveEndpoint(req, res, param, 'del');
});

botWeb.listen(3000, () => {
  console.log('API e site disponível em http://localhost:3000');
});

// ERROR
process.on('unhandledRejection', (reason, promise) => console.error(reason, promise));
process.on('uncaughtException', (reason, origin) => console.error(reason, origin));