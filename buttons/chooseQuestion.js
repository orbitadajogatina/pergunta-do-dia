const { changePageOfDropdown, questionsDataByCommand } = require('../core/chooseQuestion');

async function execute (interaction, messageOnNoQuestions) {
  const userID = interaction.user.id;
  if (userID !== interaction.message.interaction?.user.id) return;

  const dataOnID = interaction.customId.split('_');
  const action = dataOnID[2];
  const currentPage = Number(dataOnID[3]);
  const page = currentPage + (action === 'nextPage' ? 1 : -1);
  const questionsData = await questionsDataByCommand[dataOnID[1]](interaction);
  const dropdownID = dataOnID.slice(0, 2).join('_');

  interaction.update(await changePageOfDropdown(page, interaction.message.components, questionsData, dropdownID, messageOnNoQuestions));
}

function manageQuestion(interaction) {
  execute(interaction, '**Ah.** Você não tem perguntas para gerenciar.');
}

function viewQuestion(interaction) {
  execute(interaction, '**Ah.** Você ainda não criou perguntas.');
}

function sendQuestion(interaction) {
  execute(interaction, '💀 Tamo sem pergunta.');
}

function changeStatusOfQuestion(interaction) {
  execute(interaction, '💀 Tamo sem pergunta.');
}

module.exports = { manageQuestion, viewQuestion, sendQuestion, changeStatusOfQuestion }