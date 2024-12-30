const { PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const lodash = require('lodash');
const { checkAndParseQuestion, reviewQuestion, editQuestionAndMessageAlreadySent, editQuestionAndSendAgain, wasSentInTheLast24Hours } = require('../core/questionManager');
const { execute } = require('../interactions/chooseQuestion.js');
const transformQuestionsDataToEmbed = require('../core/transformQuestionsDataToEmbed');

async function editQuestion (interaction) {
  if (wasSentInTheLast24Hours(interaction.message.embeds[0])) {
    await editQuestionAlreadySent(interaction);
  } else {
    await editQuestionNotSent(interaction);
  }
}

async function editQuestionAlreadySent (interaction, editedQuestion, currentQuestion, userIsAdmin, questionID) {
  if (!editedQuestion && !currentQuestion) {
    await interaction.deferReply();
  
    const userID = interaction.user.id;
    userIsAdmin = admins.includes(userID);
    const fields = interaction.fields;
    const dataOnId = interaction.customId.split('_');
    questionID = dataOnId[2];
    
    // question, options, description, footer, image, author, status
    editedQuestion = await checkAndParseQuestion(
      fields.getTextInputValue('question'),
      fields.getTextInputValue('options'),
      fields.getTextInputValue('description'),
      fields.getTextInputValue('footer'),
      fields.getTextInputValue('image'),
      userID,
      3
    );
    const { data: currentQuestionData } = await database.from('questions').select().eq('id', questionID);
    currentQuestion = currentQuestionData;
  }
  
  editedQuestion.sentAt = currentQuestion[0].sentAt;
  editedQuestion.createdAt = currentQuestion[0].createdAt;
  editedQuestion.id = currentQuestion[0].id;

  let deleteMessage = false;
  deleteMessage = !lodash.isEqual(editedQuestion.options, currentQuestion[0].options);
  if (editedQuestion.options.find(({emoji, text}) => emoji.startsWith('$'))) deleteMessage = true;
  if (userIsAdmin) {
    if (deleteMessage) {
      return await editQuestionAndSendAgain(editedQuestion, questionID, currentQuestion[0].messageID, interaction);
    } else {
      const embed = transformQuestionsDataToEmbed(editedQuestion, false);
      return await editQuestionAndMessageAlreadySent(embed, editedQuestion, questionID, currentQuestion[0].messageID, interaction);
    }
  } else {
    await reviewQuestion(editedQuestion, interaction, userIsAdmin, 'editQuestion');
    return editedQuestion;
  }
}

async function editQuestionNotSent (interaction) {
  await interaction.deferReply();
  
  const userID = interaction.user.id;
  const userIsAdmin = admins.includes(userID);
  const fields = interaction.fields;
  const dataOnId = interaction.customId.split('_');
  const questionID = dataOnId[2];
  
  // question, options, description, footer, image, author, status
  const question = await checkAndParseQuestion(
    fields.getTextInputValue('question'), 
    fields.getTextInputValue('options'), 
    fields.getTextInputValue('description'), 
    fields.getTextInputValue('footer'), 
    fields.getTextInputValue('image'),
    userID,
    userIsAdmin ? 2 : 0
  );
  
  const { error, data } = await database.from('questions').update(question).eq('id', questionID).select();
  if (error) throw error;

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

  await reviewQuestion(data[0], interaction, userIsAdmin, 'editQuestion');
  interaction.customId = `chooseQuestion_manageQuestion_${questionID}`;
  const message = await execute(interaction, questionID, [manageButtons]);
  interaction.message.edit(message);
}

module.exports = {editQuestion, editQuestionAlreadySent}