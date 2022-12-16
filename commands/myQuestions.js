const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const database = global.database;

const properties = new SlashCommandBuilder()
  .setName('minhas-perguntas')
  .setDescription('Ver perguntas enviadas por você.');

async function transformQuestionsDataToDropdown (data) {
  const questions = data.map(question => ({label: question.question, value: `questionID_${question.id}`, emoji: ['⌛', '❌', '✅'][question.status]}));

  const items = new StringSelectMenuBuilder()
    .setCustomId('selectMyQuestions')
    .setPlaceholder('Selecionar uma pergunta...')
    .addOptions(questions);

  return new ActionRowBuilder().addComponents(items);
}

async function execute (interaction) {
  await interaction.deferReply();

  const userID = interaction.user.id;
  const questions = database.from('questions');
  const questionsData = (await questions.select('question, id, status, createdAt').eq('author', userID).order('createdAt', { ascending: false })).data.sort((a, b) => a.status - b.status);
  
  if (questionsData.length > 0) {
    const dropdown = transformQuestionsDataToDropdown(questionsData);
    await interaction.editReply({ components: [(await dropdown)] });
  } else {
    await interaction.editReply('**Ah.** Você ainda não enviou perguntas.');
  }
}

module.exports = { properties, execute };