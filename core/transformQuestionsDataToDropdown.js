
const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const lodash = require('lodash');
const moment = require('moment-timezone');

module.exports = function transformQuestionsDataToDropdown (data, page, dropdownID) {
  const questions = data.map(question => (
    {
      label: lodash.truncate(question.question, {'length': 40}), 
      value: `questionID_${question.id}`, 
      description: `${question.options.length} opções • Criado em ${moment.tz(question.createdAt, 'America/Sao_Paulo').format('DD/MM/YYYY')}`, 
      emoji: ['⌛', '❌', '✅', '☑️'][question.status]
    }
  ));
  const questionsPerPage = lodash.chunk(questions, 25);
  if (page >= questionsPerPage.length || page < 0) page = 0;

  const items = new StringSelectMenuBuilder()
    .setCustomId(dropdownID)
    .setPlaceholder(`Selecionar uma pergunta... (${questions.length})`)
    .addOptions(questionsPerPage[page]);

  const previousPageButton = new ButtonBuilder()
    .setCustomId(`${dropdownID}_previousPage_${page}`)
    .setEmoji('⬅')
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(page == 0);

  const nextPageButton = new ButtonBuilder()
    .setCustomId(`${dropdownID}_nextPage_${page}`)
    .setEmoji('➡️')
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(page == questionsPerPage.length - 1);

  return [new ActionRowBuilder().addComponents(items), new ActionRowBuilder().addComponents(previousPageButton, nextPageButton)];
}