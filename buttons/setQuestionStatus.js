const lodash = require('lodash');
const { wasSentInTheLast24Hours, editQuestionAndMessageAlreadySent, editQuestionAndSendAgain } = require('../core/questionManager');
const transformEmbedToQuestionsData = require('../core/transformEmbedToQuestionsData');
const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

async function executeAlreadySent (interaction, statusNumber) {
  const statusText = ['Recusada', 'Aprovada'][statusNumber - 1];
  const message = interaction.message;
  const questionID = interaction.customId.split('_')[2];
  const reason = interaction?.fields?.getTextInputValue('reason');
  let embed = message.embeds[0].data;
  
  const question = await transformEmbedToQuestionsData(embed);
  const { data: currentQuestion } = await database.from('questions').select('messageID,author,options').eq('id', questionID);
  
  interaction.message.edit({content: `Pergunta ${statusText.toLowerCase()} por <@${interaction.user.id}>${reason ? ' pelo seguinte motivo: ' + reason : ''}. Dá uma conferida lá no <#${process.env.QUESTIONS_CHANNEL_ID}>!`, embeds: [embed], components: []});
  const authorDM = await bot.users.fetch(currentQuestion[0].author);
  authorDM.send({content: `**${['Puxa...', 'Boa notícia!'][statusNumber - 1]}** Esta pergunta foi ${statusText.toLowerCase()}. ${statusNumber == 1 ? `Quem sabe ela pode ser aceita se você editá-la.${reason ? '\n\n**Motivo:** ' + reason : ''}` : `Dá uma conferida lá no <#${process.env.QUESTIONS_CHANNEL_ID}>!`}`, embeds: [embed]});

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
  const reason = interaction?.fields?.getTextInputValue('reason');
  let embed = message.embeds[0].data;

  database.from('questions').update({ status: statusNumber }).eq('id', questionID).select().then(async res => {
    if (res.error) throw res.error;

    embed.fields[0].value = statusText;
    interaction.update({content: `Pergunta ${statusText.toLowerCase()} por <@${interaction.user.id}>${reason ? ' pelo seguinte motivo: ' + reason : ''}.`, embeds: [embed], components: []});

    const authorDM = await bot.users.fetch(res.data[0].author);
    authorDM.send({content: `**${['Puxa...', 'Boa notícia!'][statusNumber - 1]}** Esta pergunta foi ${statusText.toLowerCase()}. ${statusNumber == 1 ? `Quem sabe ela pode ser aceita se você editá-la.${reason ? '\n\n**Motivo:** ' + reason : ''}` : 'Será enviada sabe-se lá quando.'}`, embeds: [embed]});
  });
}

async function approve (interaction) {
  if (wasSentInTheLast24Hours(interaction.message.embeds[0])) {
    executeAlreadySent(interaction, 2);
  } else {
    executeNotSent(interaction, 2);
  }
}

async function askReason (interaction) {
  const reasonModal = new ModalBuilder()
    .setCustomId('decline_execute_' + interaction.customId.split('_')[2])
    .setTitle('Recusar pergunta')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('reason')
          .setLabel('Qual o motivo para recusar?')
          .setPlaceholder('Você pode deixar em branco, se quiser!')
          .setMaxLength(280)
          .setRequired(false)
          .setStyle(TextInputStyle.Paragraph)    
      )
    );

  await interaction.showModal(reasonModal);
}

async function decline (interaction) {
  if (wasSentInTheLast24Hours(interaction.message.embeds[0])) {
    executeAlreadySent(interaction, 1);
  } else {
    executeNotSent(interaction, 1);
  }
}

module.exports = {approve, decline, askReason}