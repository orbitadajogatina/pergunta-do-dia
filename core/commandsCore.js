'use strict';

const { REST, Routes, Collection } = require('discord.js');
const fs = require('fs');
const bot = global.bot;
const clientID = process.env.DISCORD_CLIENT_ID;

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

bot.commands = new Collection();

for (const file of commandFiles) {
	const command = require(`../commands/${file}`);
	bot.commands.set(command.properties.name, command);
	commands.push(command.properties.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

async function deployCommands() {
	try {
		const data = await rest.put(
			Routes.applicationCommands(clientID),
			{ body: commands },
		);

		console.log(`${data.length} comandos carregados.`);
	} catch (error) {
		console.error(error);
	}
}

module.exports = {deployCommands};