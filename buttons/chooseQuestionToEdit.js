const database = global.database;
const transformQuestionsDataToDropdown = require('../core/transformQuestionsDataToDropdown');

async function execute (interaction, page) {
  const userID = interaction.user.id;
  if (userID == interaction.message.interaction.user.id) {
    const questions = database.from('questions');
    const questionsData = (await questions.select('question, id, status, createdAt').eq('author', userID).is('sentAt', null).order('createdAt', { ascending: false })).data.sort((a, b) => a.status - b.status);
    
    if (questionsData.length > 0) {
      const oldComponents = interaction.message.components;
      let changeFieldsButtons = [];
      if (oldComponents[0].components[0].data.custom_id.includes('question')) changeFieldsButtons = [oldComponents[0]];

      const dropdown = transformQuestionsDataToDropdown(questionsData, page, 'chooseQuestionToEdit');

      await interaction.update({ components: [...changeFieldsButtons, ...dropdown] });
    } else {
      await interaction.update('**Ah.** Você não tem perguntas para editar.');
    }
  }
}

async function previousPage (interaction) {
  const currentPage = Number(interaction.customId.split('_')[2]);
  execute(interaction, currentPage - 1);
}

async function nextPage (interaction) {
  const currentPage = Number(interaction.customId.split('_')[2]);
  execute(interaction, currentPage + 1);
}

module.exports = {previousPage, nextPage}