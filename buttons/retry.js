const { ModalBuilder } = require('discord.js');
const { buildNewQuestionModal } = require('../commands/newQuestion.js');

async function execute (interaction) {
  let questionBuilder = buildNewQuestionModal();

  const userID = interaction.user.id;
  const messageContent = interaction.message.content;
  const mentionOnMessage = messageContent.match(/<@(\d{17,19})>/);
  if (userID !== mentionOnMessage[1]) return;

  const draftFieldsAsEntries = messageContent.match(/(.*?): `([^`]*)`/g).map(field => {
    const fieldParsed = field.match(/(.*?): `([^`]*)`/);
    return [fieldParsed[1], fieldParsed[2] == '-' ? '' : fieldParsed[2]];
  });
  const draftFields = Object.fromEntries(draftFieldsAsEntries)
  questionBuilder.components.forEach((component) => {
    const currentField = component.components[0].data.custom_id;
    component.components[0].data.value = draftFields[currentField];
  });

  const modalID = interaction.customId.slice(6);
  const titlesByID = {
    newQuestion: 'Nova pergunta',
    manageQuestion: 'Editar pergunta'
  }
  const components = questionBuilder.components;

  const retryQuestionModal = new ModalBuilder()
    .setCustomId(modalID)
    .setTitle(titlesByID[modalID])
    .addComponents(components);

  interaction.showModal(retryQuestionModal);
}

function newQuestion (interaction) {
  execute(interaction);
}

function editQuestion (interaction) {
  execute(interaction);
}

module.exports = {newQuestion, editQuestion}