const fs = require('fs');
const { SlashCommandBuilder } = require('discord.js');

const properties = new SlashCommandBuilder()
.setName('forçar-envio')
.setDescription('Forçar o envio de uma pergunta.')
.setDefaultMemberPermissions(0)
.setDMPermission(false);

function execute (interaction) {
  const userIsAdmin = interaction.user.id == '668199172276748328' || interaction.member.permissions.has('ADMINISTRATOR');

  if (userIsAdmin) {
    interaction.reply('**Tá bom.** Enviando pergunta agora.')
    require('../core/sendCore').main();
  } else {
    interaction.reply({content: '**Irmão, esqueça.** Você não é admin, não adianta.', ephemeral: true})
  }
}

module.exports = { properties, execute };