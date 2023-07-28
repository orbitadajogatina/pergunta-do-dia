const lodash = require('lodash');
const { wasSentInTheLast24Hours, editQuestionAndMessageAlreadySent, editQuestionAndSendAgain } = require('../core/questionManager');
const transformEmbedToQuestionsData = require('../core/transformEmbedToQuestionsData');

async function executeAlreadySent (interaction, statusNumber) {
  const statusText = ['Recusada', 'Aprovada'][statusNumber - 1];
  const message = interaction.message;
  const questionID = interaction.customId.split('_')[2];
  let embed = message.embeds[0].data;
  const question = await transformEmbedToQuestionsData(embed);
  const { data: currentQuestion } = await database.from('questions').select('messageID,author,options').eq('id', questionID);
  
  interaction.message.edit({content: `Pergunta ${statusText.toLowerCase()} por <@${interaction.user.id}>. Dá uma conferida lá no <#${process.env.QUESTIONS_CHANNEL_ID}>!`, embeds: [embed], components: []});
  const authorDM = await bot.users.fetch(currentQuestion[0].author);
  authorDM.send({content: `**${['Puxa...', 'Boa notícia!'][statusNumber - 1]}** Esta pergunta foi ${statusText.toLowerCase()}. ${statusNumber == 1 ? 'Quem sabe ela pode ser aceita se você editá-la.' : `Dá uma conferida lá no <#${process.env.QUESTIONS_CHANNEL_ID}>!`}`, embeds: [embed]});

  if (statusNumber === 1) return;
  delete embed.fields;

  let deleteMessage = false;
  deleteMessage = !lodash.isEqual(question.options, currentQuestion[0].options);
  if (question.options.find(({emoji, text}) => emoji.startsWith('$'))) deleteMessage = true;

  if (deleteMessage) {
    editQuestionAndSendAgain(question, questionID, currentQuestion[0].messageID);
  } else {
    await editQuestionAndMessageAlreadySent(embed, question, questionID, currentQuestion[0].messageID);
  }
}

async function executeNotSent (interaction, statusNumber) {
  const statusText = ['Recusada', 'Aprovada'][statusNumber - 1];
  const message = interaction.message;
  const questionID = interaction.customId.split('_')[2];
  let embed = message.embeds[0].data;

  database.from('questions').update({ status: statusNumber }).eq('id', questionID).select().then(async res => {
    if (res.error) throw res.error;

    embed.fields[0].value = statusText;
    interaction.update({content: `Pergunta ${statusText.toLowerCase()} por <@${interaction.user.id}>.`, embeds: [embed], components: []});

    const authorDM = await bot.users.fetch(res.data[0].author);
    authorDM.send({content: `**${['Puxa...', 'Boa notícia!'][statusNumber - 1]}** Esta pergunta foi ${statusText.toLowerCase()}. ${statusNumber == 1 ? 'Quem sabe ela pode ser aceita se você editá-la.' : 'Será enviada sabe-se lá quando.'}`, embeds: [embed]});
  });
}

async function approve (interaction) {
  if (wasSentInTheLast24Hours(interaction.message.embeds[0])) {
    executeAlreadySent(interaction, 2);
  } else {
    executeNotSent(interaction, 2);
  }
}

async function decline (interaction) {
  if (wasSentInTheLast24Hours(interaction.message.embeds[0])) {
    executeAlreadySent(interaction, 1);
  } else {
    executeNotSent(interaction, 1);
  }
}

module.exports = {approve, decline}