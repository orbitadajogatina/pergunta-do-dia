const { SlashCommandBuilder } = require('discord.js');
const database = global.database;
const transformQuestionsDataToDropdown = require('../core/transformQuestionsDataToDropdown');

const properties = new SlashCommandBuilder()
  .setName('minhas-perguntas')
  .setDescription('Ver perguntas enviadas por você.');

async function execute (interaction) {
  await interaction.deferReply();

  const userID = interaction.user.id;
  const questions = database.from('questions');
  const questionsData = (await questions.select('question, id, status, createdAt').eq('author', userID).order('createdAt', { ascending: false })).data.sort((a, b) => a.status - b.status);
  
  if (questionsData.length > 0) {
    const dropdown = transformQuestionsDataToDropdown(questionsData, 0, 'selectMyQuestions');
    await interaction.editReply({ components: dropdown });
  } else {
    await interaction.editReply('**Ah.** Você ainda não enviou perguntas.');
  }
}

module.exports = { properties, execute };