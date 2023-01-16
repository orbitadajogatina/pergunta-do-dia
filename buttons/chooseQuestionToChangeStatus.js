const database = global.database;
const transformQuestionsDataToDropdown = require('../core/transformQuestionsDataToDropdown');
const sendCore = require('../core/sendCore');

async function execute (interaction, page) {
  const userID = interaction.user.id;
  if (userID == interaction.message.interaction.user.id) {
    const questions = database.from('questions');
    const questionsData = (await questions.select('question, id, status, createdAt').is('sentAt', null)).data;
    
    if (questionsData.length > 0) {
      const oldComponents = interaction.message.components;
      let statusButtons = [];
      if (oldComponents[0].components[0].data.custom_id.includes('approve')) statusButtons = [oldComponents[0]];

      const dropdown = transformQuestionsDataToDropdown(questionsData, page, 'chooseQuestionToChangeStatus');

      await interaction.update({ components: [...statusButtons, ...dropdown] });
    } else {
      await interaction.update('💀 Tamo sem pergunta.');
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