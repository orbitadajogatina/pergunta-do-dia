const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const sendCore = require('../core/sendCore');
const database = global.database;
const transformQuestionsDataToDropdown = require('../core/transformQuestionsDataToDropdown');

const properties = new SlashCommandBuilder()
  .setName('forçar-envio')
  .setDescription('Forçar o envio de uma pergunta.')
  .setDefaultMemberPermissions(0)
  .addSubcommand(subcommand =>
      subcommand
        .setName('aleatório')
        .setDescription('Enviar uma pergunta aleatória.'))
  .addSubcommand(subcommand =>
    subcommand
      .setName('específico')
      .setDescription('Escolher uma pergunta.'))
  .setDMPermission(false);

function execute (interaction) {
  const userIsAdmin = interaction.user.id == '668199172276748328' || interaction.member.permissions.has([PermissionsBitField.Flags.Administrator]);

  if (userIsAdmin) {
    const chosenType = interaction.options._subcommand;

    if (chosenType == 'aleatório') {
      interaction.reply('**Tá bom.** Enviando pergunta agora.');
      sendCore.main();
    } else if (chosenType == 'específico') {
      chooseQuestionToSend(interaction);
    }
  } else {
    interaction.reply({content: '**Irmão, esqueça.** Você não é admin, não adianta.', ephemeral: true})
  }
}

async function chooseQuestionToSend (interaction) {
  await interaction.deferReply();

  const questions = database.from('questions');
  const questionsData = (await questions.select('question, id, status, createdAt').eq('status', 2).is('sentAt', null)).data;
  
  if (questionsData.length > 0) {
    const dropdown = transformQuestionsDataToDropdown(questionsData, 0, 'chooseQuestionToSend');
    await interaction.editReply({ components: dropdown });
  } else {
    await interaction.editReply('💀 Tamo sem pergunta.');
  }
}

module.exports = { properties, execute };