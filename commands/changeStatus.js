const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { makeMessageWithDropdownsAndButtons, questionsDataByCommand } = require('../core/chooseQuestion');

const properties = new SlashCommandBuilder()
  .setName('alterar-situação')
  .setDescription('Aprovar ou recusar uma pergunta que já foi previamente aprovada ou recusada.')
  .setDefaultMemberPermissions(0)
  .setDMPermission(false);

async function execute (interaction) {
  const userIsAdmin = interaction.user.id == '668199172276748328' || interaction.member.permissions.has([PermissionsBitField.Flags.Administrator]);

  if (!userIsAdmin) {
    interaction.reply({content: '**Irmão, esqueça.** Você não é admin, não adianta.', ephemeral: true});
    return;
  }

  await interaction.deferReply();
  const questionsData = await questionsDataByCommand.changeStatusOfQuestion(interaction);
  const messageWithDropdownsAndButtons = makeMessageWithDropdownsAndButtons(questionsData, 'chooseQuestion_changeStatusOfQuestion', '💀 Tamo sem pergunta.');
  interaction.editReply(messageWithDropdownsAndButtons);
}

module.exports = { properties, execute, id: 'changeStatus' };