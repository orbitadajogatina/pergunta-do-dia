const { questionBuilder } = require('../commands/newQuestion.js');
const { questionEditBuilder } = require('../buttons/editQuestion.js');

async function newQuestion (interaction) {
  const messageContent = interaction.message.content;
  const draftFields = messageContent.match(/`([^`]*)`/g).map(match => match.replace(/`/g, ''));

  let questionForm = questionBuilder();
  questionForm.components.forEach((component, index) => component.components[0].data.value = draftFields[index] == '-' ? '' : draftFields[index]);

  await interaction.showModal(questionForm);
}

async function editQuestion (interaction) {
  const messageContent = interaction.message.content;
  const infoOnID = interaction.customId.split('_');
  const fieldToEdit = infoOnID[3];
  const draftFields = messageContent.match(/`([^`]*)`/g).map(match => match.replace(/`/g, ''));

  await interaction.showModal(questionEditBuilder(fieldToEdit, interaction.customId.slice(6), draftFields[0]));
}

module.exports = {newQuestion, editQuestion}