const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { makeMessageWithDropdownsAndButtons, questionsDataByCommand } = require('../core/chooseQuestion');

const properties = new SlashCommandBuilder()
  .setName('alterar-situação')
  .setDescription('Aprovar ou recusar uma pergunta que já foi previamente aprovada ou recusada.')
  .setDefaultMemberPermissions(0)
  .setDMPermission(false)
  .addStringOption(option =>
    option.setName('pergunta')
      .setDescription('Pesquise por texto em perguntas, descrições e rodapés.')
      .setRequired(false))
  .addIntegerOption(option =>
    option.setName('situação')
      .setDescription('Filtre pela situação das perguntas.')
      .setRequired(false)
      .addChoices(
        { name: 'Aprovadas', value: 2 },
        { name: 'Enviadas', value: 3 },
        { name: 'Recusadas', value: 1 },
        { name: 'Em análise', value: 0 }
      ));

async function execute (interaction) {
  const userIsAdmin = admins.includes(interaction.user.id);

  if (!userIsAdmin) {
    interaction.reply({content: '**Irmão, esqueça.** Você não é admin, não adianta.', ephemeral: true});
    return;
  }

  await interaction.deferReply();
  const questionsData = await questionsDataByCommand.changeStatusOfQuestion(interaction);
  const options = interaction.options?.data;
  
  const messageWithDropdownsAndButtons = makeMessageWithDropdownsAndButtons(questionsData, 'chooseQuestion_changeStatusOfQuestion', '💀 Tamo sem pergunta.', options);
  interaction.editReply(messageWithDropdownsAndButtons);
}

module.exports = { properties, execute, id: 'changeStatus' };