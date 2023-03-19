const { SlashCommandBuilder } = require('discord.js');

const properties = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Testar a conexão.');

async function execute(interaction) {
  await interaction.reply('Pong!');
}

module.exports = { properties, execute };
