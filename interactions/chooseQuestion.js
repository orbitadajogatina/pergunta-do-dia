const { selectQuestion, questionsDataByCommand } = require('../core/chooseQuestion');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

async function execute(interaction, questionID = interaction.values[0].slice(11), otherComponents) {
  const userID = interaction.user.id;
  if (userID !== interaction.message.interaction.user.id) return;

  const dataOnID = interaction.customId.split('_');
  const questionsData = await questionsDataByCommand[dataOnID[1]](interaction);
  const pageOnButton = interaction.message.components.find(actionRow => actionRow.components[0].data.custom_id.includes('previousPage'))?.components[0].data.custom_id.split('_').at(-1);
  const currentPage = Number(pageOnButton) || 0;
  const dropdownID = dataOnID.slice(0, 2).join('_');
  
  return await selectQuestion(questionID, questionsData, dropdownID, otherComponents, currentPage);
}

async function manageQuestion(interaction) {
  await interaction.deferUpdate();

  const questionID = interaction.values[0].slice(11);
  const manageButtons = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`editQuestion_editQuestion_${questionID}`)
        .setLabel('Editar')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`deleteQuestion_deleteQuestion_${questionID}`)
        .setLabel('Apagar permanentemente')
        .setStyle(ButtonStyle.Danger)
    );

  const message = await execute(interaction, questionID, [manageButtons]);
  if (!message) return;
  interaction.editReply(message);
}

async function viewQuestion(interaction) {
  await interaction.deferUpdate();
  const message = await execute(interaction);
  if (!message) return;
  interaction.editReply(message);
}

async function sendQuestion(interaction) {
  await interaction.deferUpdate();

  const questionID = interaction.values[0].slice(11);
  const sendButton = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`sendNow_sendNow_${questionID}`)
        .setLabel('Enviar')
        .setStyle(ButtonStyle.Success)
    );

  const message = await execute(interaction, questionID, [sendButton]);
  if (!message) return;
  interaction.editReply(message);
}

async function changeStatusOfQuestion(interaction) {
  await interaction.deferUpdate();

  const questionID = interaction.values[0].slice(11);
  const statusButtons = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`setQuestionStatus_approve_${questionID}`)
        .setLabel('Aprovar')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`setQuestionStatus_askReason_${questionID}`)
        .setLabel('Recusar')
        .setStyle(ButtonStyle.Danger)
    );

  const message = await execute(interaction, questionID, [statusButtons]);
  if (!message) return;
  interaction.editReply(message);
}

module.exports = { execute, manageQuestion, viewQuestion, sendQuestion, changeStatusOfQuestion }