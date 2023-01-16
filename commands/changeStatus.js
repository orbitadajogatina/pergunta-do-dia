const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const database = global.database;
const transformQuestionsDataToDropdown = require('../core/transformQuestionsDataToDropdown');

const properties = new SlashCommandBuilder()
  .setName('alterar-situação')
  .setDescription('Aprovar ou recusar uma pergunta que já foi previamente aprovada ou recusada.')
  .setDefaultMemberPermissions(0)
  .setDMPermission(false);

function execute (interaction) {
  const userIsAdmin = interaction.user.id == '668199172276748328' || interaction.member.permissions.has([PermissionsBitField.Flags.Administrator]);

  if (userIsAdmin) {
    chooseQuestionToChangeStatus(interaction);
  } else {
    interaction.reply({content: '**Irmão, esqueça.** Você não é admin, não adianta.', ephemeral: true})
  }
}

async function chooseQuestionToChangeStatus (interaction) {
  await interaction.deferReply();

  const questions = database.from('questions');
  const questionsData = (await questions.select('question, id, status, createdAt').is('sentAt', null)).data;
  
  if (questionsData.length > 0) {
    const dropdown = transformQuestionsDataToDropdown(questionsData, 0, 'chooseQuestionToChangeStatus');
    await interaction.editReply({ components: dropdown });
  } else {
    await interaction.editReply('💀 Tamo sem pergunta.');
  }
}

module.exports = { properties, execute };