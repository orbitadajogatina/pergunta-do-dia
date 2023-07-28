const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const moment = require('moment-timezone');
const transformQuestionsDataToEmbed = require('./transformQuestionsDataToEmbed');
const { parseOptions, parseImage } = require('./parseFields');
const sendCore = require('../core/sendCore');

async function checkAndParseQuestion (question, options, description, footer, image, author, status) {
  const arrayOptions = await parseOptions(options);
  const imageURL = await parseImage(image, question);

  const questionObject = {
    question,
    options: arrayOptions,
    description: description.replace(/[\r\n]+/g, '\n'),
    footer,
    image: imageURL,
    author,
    status // 0 => Aguardando; 1 => Recusado; 2 => Aprovado; 3 => Enviada.
  };

  return questionObject;
}

async function reviewQuestion (question, interaction, userIsAdmin, actionType) {
  const actions = {
    newQuestion: {
      notifications: {
        user: '**Show de bola!** Sua pergunta foi criada e ',
        admin: '**Nova pergunta!**'
      }
    },
    editQuestion: {
      notifications: {
        user: '**Bão demais!** Sua pergunta foi editada e ',
        admin: '**Uma pergunta quer ser editada!**'
      }
    } 
  }
  const nextStep = userIsAdmin ? 'será enviada sabe-se lá quando.' : 'será analisada. Fique de olho na DM para saber se ela foi aceita ou não. Você também pode usar `/minhas-perguntas` para rever suas perguntas.';
  await interaction.editReply(actions[actionType].notifications.user + nextStep);

  const embed = transformQuestionsDataToEmbed(question, true);
  if (actionType === 'newQuestion') interaction.followUp({embeds: [embed], ephemeral: true})

  if (userIsAdmin) return;

  const buttons = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`setQuestionStatus_approve_${question.id}`)
        .setLabel('Aprovar')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`setQuestionStatus_decline_${question.id}`)
        .setLabel('Recusar')
        .setStyle(ButtonStyle.Danger)
    );

  (await bot.channels.fetch(process.env.MANAGE_CHANNEL_ID)).send({content: actions[actionType].notifications.admin, embeds: [embed], components: [buttons]});
}

function wasSentInTheLast24Hours (embed) {
  const sentAtFieldValue = embed.data.fields.find(field => field.name === 'Data de Envio').value;
  if (sentAtFieldValue === '-') return false;
  const unixSentAt = sentAtFieldValue.match(/\<t\:(.*?)\:R\>/)[1];
  const momentSentAt = moment.unix(unixSentAt);
  const twentyFourHoursAgo = moment.tz(moment().subtract(24, 'hours'), 'America/Sao_Paulo');
  return momentSentAt.isSameOrAfter(twentyFourHoursAgo);
}

async function editQuestionAndMessageAlreadySent (embed, question, questionID, messageID, interaction) {
  const channel = await bot.channels.fetch(process.env.QUESTIONS_CHANNEL_ID) || await bot.channels.cache.get(process.env.QUESTIONS_CHANNEL_ID);
  const message = await channel.messages.fetch(messageID) || await channel.messages.cache.get(messageID);

  await database.from('questions').update(question).eq('id', questionID);
  message.edit({embeds: [embed]}).then(() => {
    if (interaction) interaction.editReply(`**Perfeito, campeão!** Pergunta editada com sucesso. Dá uma conferida lá no ${channel.toString()}!`);
  }).catch((error) => {
    throw error;
  });
}

async function editQuestionAndSendAgain (question, questionID, messageID, interaction) {
  const channel = await bot.channels.fetch(process.env.QUESTIONS_CHANNEL_ID) || await bot.channels.cache.get(process.env.QUESTIONS_CHANNEL_ID);
  const message = await channel.messages.fetch(messageID) || await channel.messages.cache.get(messageID);

  const {data: questionWithAllData} = await database.from('questions').update(question).eq('id', questionID).select();
  message.delete().then(() => {
    if (interaction) interaction.editReply(`**Perfeito, campeão!** Pergunta editada com sucesso. Dá uma conferida lá no ${channel.toString()}!`);
    sendCore.sendQuestion(questionWithAllData[0]);
  }).catch((error) => {
    throw error;
  });
}

module.exports = { checkAndParseQuestion, reviewQuestion, editQuestionAndMessageAlreadySent, editQuestionAndSendAgain, wasSentInTheLast24Hours }