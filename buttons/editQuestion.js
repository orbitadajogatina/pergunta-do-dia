const { ModalBuilder } = require('discord.js');
const { questionBuilder } = require('../commands/newQuestion.js');

async function editField (interaction) {
  const infoOnID = interaction.customId.split('_');
  const fieldToEdit = infoOnID[2];
  const questionID = infoOnID[3];

  const questions = database.from('questions');
  const question = (await questions.select().eq('id', questionID)).data[0];
  const oldValue = fieldToEdit === 'options' ? question[fieldToEdit].map(({emoji, text}) => `${emoji.replace(/\[Imagem\]\((.*?)\)/, '$1')} - ${text}`).join('\n') : question[fieldToEdit];

  await interaction.showModal(questionEditBuilder(fieldToEdit, interaction.customId, oldValue));
}

function questionEditBuilder(fieldToEdit, id, oldValue) {
  const questionForm = questionBuilder();
  let component = questionForm.components.find(component => component.components[0].data.custom_id === fieldToEdit);
  if (oldValue) component.components[0].setValue(oldValue);

  return new ModalBuilder()
    .setCustomId(id)
    .setTitle('Editar pergunta')
    .addComponents(component);
}

module.exports = {editField, questionEditBuilder}