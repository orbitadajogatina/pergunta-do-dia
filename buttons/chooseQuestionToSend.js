const database = global.database;
const transformQuestionsDataToDropdown = require('../core/transformQuestionsDataToDropdown');
const sendCore = require('../core/sendCore');

async function execute (interaction, page) {
  const userID = interaction.user.id;
  if (userID == interaction.message.interaction.user.id) {
    const questions = database.from('questions');
    const questionsData = (await questions.select('question, id, status, createdAt').eq('status', 2).is('sentAt', null).order('createdAt', { ascending: false })).data;
    
    if (questionsData.length > 0) {
      const oldComponents = interaction.message.components;
      let sendNowButton = [];
      if (oldComponents[0].components[0].data.custom_id.includes('sendNow')) sendNowButton = [oldComponents[0]];

      const dropdown = transformQuestionsDataToDropdown(questionsData, page, 'chooseQuestionToSend');

      await interaction.update({ components: [...sendNowButton, ...dropdown] });
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

async function sendNow (interaction) {
  interaction.update({content: '**Tá bom.** Enviando pergunta agora.', components: [], embeds: []});
  const questionID = interaction.customId.split('_')[2];
  const chosenQuestion = (await database.from('questions').select().eq('id', questionID)).data[0];
  sendCore.sendQuestion(chosenQuestion);
}

module.exports = {previousPage, nextPage, sendNow}