const { SlashCommandBuilder } = require('discord.js');
const database = global.database;
const transformQuestionsDataToDropdown = require('../core/transformQuestionsDataToDropdown');

const properties = new SlashCommandBuilder()
  .setName('editar')
  .setDescription('Editar uma pergunta');

async function execute (interaction) {
  await interaction.deferReply();

  const userID = interaction.user.id;
  const questions = database.from('questions');
  const questionsData = (await questions.select('question, id, status, createdAt').eq('author', userID).is('sentAt', null).order('createdAt', { ascending: false })).data.sort((a, b) => a.status - b.status);
  
  if (questionsData.length > 0) {
    const dropdown = transformQuestionsDataToDropdown(questionsData, 0, 'chooseQuestionToEdit');
    await interaction.editReply({ components: dropdown });
  } else {
    await interaction.editReply('**Ah.** Você não tem perguntas para editar.');
  }
}

module.exports = { properties, execute };