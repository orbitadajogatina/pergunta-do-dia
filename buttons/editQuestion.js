const { ModalBuilder } = require('discord.js');
const { questionBuilder } = require('../commands/newQuestion.js');

async function editQuestion(interaction) {
  const userID = interaction.user.id;
  if (userID !== interaction.message.interaction?.user.id) return;

  const dataOnID = interaction.customId.split('_');
  const questionID = dataOnID[2];
  const question = (await database.from('questions').select().eq('id', questionID)).data[0];

  questionBuilder.components.forEach((component) => {
    const currentField = component.components[0].data.custom_id;
    component.components[0].data.value = currentField === 'options' ? question[currentField].map(({emoji, text}) => `${emoji.replace(/\[Imagem\]\((.*?)\)/, '$1')} - ${text}`).join('\n') : question[currentField];
  });
  const components = questionBuilder.components;

  const questionEditModal = new ModalBuilder()
    .setCustomId(interaction.customId)
    .setTitle('Editar pergunta')
    .addComponents(components);

  interaction.showModal(questionEditModal);
}

module.exports = {editQuestion}