const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const moment = require('moment-timezone');
const transformQuestionsDataToEmbed = require('./transformQuestionsDataToEmbed');
const { parseOptions, parseImage } = require('./parseFields');

async function checkAndParseQuestion (question, options, description, footer, image, author, status) {
  const arrayOptions = await parseOptions(options);
  const imageURL = await parseImage(image, question);

  const questionObject = {
    question,
    options: arrayOptions,
    description: description?.replace(/[\r\n]+/g, '\n') || null,
    footer: footer || null,
    image: imageURL,
    author,
    status // 0 => Aguardando; 1 => Recusado; 2 => Aprovado; 3 => Enviada.
  };

  return questionObject;
}

async function searchForSimilarQuestions (query, newQuestionID, embeds = true) {
  const {data: similarQuestions} = await database.rpc('similarity_questions', {query, new_question_id: newQuestionID});
  if (!embeds) return similarQuestions;
  const similarQuestionsAsEmbeds = similarQuestions?.map(question => transformQuestionsDataToEmbed(question, true, question.search_score));
  return similarQuestionsAsEmbeds;
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
  if (interaction) await interaction.editReply(actions[actionType].notifications.user + nextStep);

  const embed = transformQuestionsDataToEmbed(question, true);
  let similarQuestions = await searchForSimilarQuestions(question.question, question.id);
  if (actionType === 'newQuestion' && interaction) {
    if (userIsAdmin) {
      const deleteButton = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`deleteQuestion_deleteQuestion_${question.id}`)
          .setLabel('Apagar permanentemente')
          .setStyle(ButtonStyle.Danger)
      );

      interaction.followUp({embeds: [embed, ...similarQuestions.slice(0, 5)], ephemeral: true, components: similarQuestions.length > 0 ? [deleteButton] : []});

      return;
    } else {
      interaction.followUp({embeds: [embed], ephemeral: true});
    }
  }

  const buttons = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`setQuestionStatus_approve_${question.id}`)
        .setLabel('Aprovar')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`setQuestionStatus_askReason_${question.id}`)
        .setLabel('Recusar')
        .setStyle(ButtonStyle.Danger)
    );

  (await bot.channels.fetch(process.env.MANAGE_CHANNEL_ID)).send({content: actions[actionType].notifications.admin, embeds: [embed, ...similarQuestions], components: [buttons]});
}

function wasSentInTheLast24Hours (embed) {
  const sentAtFieldValue = embed.data.fields.find(field => field.name === 'Data de Envio').value;
  if (sentAtFieldValue === '-') return false;
  const unixSentAt = sentAtFieldValue.match(/\<t\:(.*?)\:R\>/)[1];
  const momentSentAt = moment.unix(unixSentAt);
  const twentyFourHoursAgo = moment.tz(moment().subtract(24, 'hours'), 'America/Sao_Paulo');
  return momentSentAt.isSameOrAfter(twentyFourHoursAgo);
}

async function editQuestionAndMessageAlreadySent(embed, question, questionID, messageID, interaction) {
  try {
    const channel = await bot.channels.fetch(process.env.QUESTIONS_CHANNEL_ID) || await bot.channels.cache.get(process.env.QUESTIONS_CHANNEL_ID);
    const message = await channel.messages.fetch(messageID) || await channel.messages.cache.get(messageID);

    const { data: questionWithAllData } = await database.from('questions').update(question).eq('id', questionID).select().single();

    await message.edit({ embeds: [embed] });

    if (interaction) await interaction.editReply(`**Perfeito, campeão!** Pergunta editada com sucesso. Dá uma conferida lá no ${channel.toString()}!`);

    return questionWithAllData;
  } catch (error) {
    throw error;
  }
}

async function editQuestionAndSendAgain(question, questionID, messageID, interaction) {
  try {
    const channel = await bot.channels.fetch(process.env.QUESTIONS_CHANNEL_ID) || await bot.channels.cache.get(process.env.QUESTIONS_CHANNEL_ID);
    const message = await channel.messages.fetch(messageID) || await channel.messages.cache.get(messageID);

    const { data: questionWithAllData } = await database.from('questions').update(question).eq('id', questionID).select().single();

    await message.delete();

    if (interaction) await interaction.editReply(`**Perfeito, campeão!** Pergunta editada com sucesso. Dá uma conferida lá no ${channel.toString()}!`);
    const sendCore = require('../core/sendCore');
    const {data: questionUpdated} = await sendCore.sendQuestion(questionWithAllData);
    
    return questionUpdated;
  } catch (error) {
    throw error;
  }
}

module.exports = { checkAndParseQuestion, reviewQuestion, editQuestionAndMessageAlreadySent, editQuestionAndSendAgain, wasSentInTheLast24Hours, searchForSimilarQuestions }