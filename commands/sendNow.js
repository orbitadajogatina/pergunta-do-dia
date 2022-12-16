const fs = require('fs');
const { SlashCommandBuilder } = require('discord.js');
const administrators = JSON.parse(fs.readFileSync('./resources/administrators.json', 'utf-8')).map(administrator => administrator.id);

const properties = new SlashCommandBuilder()
.setName('forçar-envio')
.setDescription('Forçar o envio de uma pergunta.')
.setDefaultMemberPermissions(0)
.setDMPermission(false);

function execute (interaction) {
  const userID = interaction.user.id;
  const userIsAdmin = administrators.includes(userID);

  if (userIsAdmin) {
    interaction.reply('**Tá bom.** Enviando pergunta agora.')
    require('../core/sendCore').main();
  } else {
    interaction.reply({content: '**Irmão, esqueça.** Você não é admin, não adianta.', ephemeral: true})
  }
}

module.exports = { properties, execute };