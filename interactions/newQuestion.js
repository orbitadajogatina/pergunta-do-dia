const { PermissionsBitField } = require('discord.js');
const { checkAndParseQuestion, reviewQuestion } = require('../core/questionManager');

async function execute (interaction) {
  await interaction.deferReply();
  
  const userID = interaction.user.id;
  const userIsAdmin = userID == '668199172276748328' || interaction.member?.permissions.has([PermissionsBitField.Flags.Administrator]) || false;
  const fields = interaction.fields;
  
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
  
  const { error, data } = await database.from('questions').insert(question).select();
  if (error) throw error;
  reviewQuestion(data[0], interaction, userIsAdmin, 'newQuestion');
}

module.exports = {execute}