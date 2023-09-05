const { PermissionsBitField } = require('discord.js');
const { decline } = require('../buttons/setQuestionStatus');

async function execute (interaction) {
  decline(interaction);
}

module.exports = {execute}