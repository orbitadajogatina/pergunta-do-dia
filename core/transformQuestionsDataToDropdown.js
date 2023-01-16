
const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const lodash = require('lodash');

module.exports = function transformQuestionsDataToDropdown (data, page, dropdownID) {
  const questions = data.map(question => ({label: question.question, value: `questionID_${question.id}`, emoji: ['⌛', '❌', '✅', '☑️'][question.status]}));
  const questionsPerPage = lodash.chunk(questions, 25);
  if (page >= questionsPerPage.length || page < 0) page = 0;

  const items = new StringSelectMenuBuilder()
    .setCustomId(dropdownID)
    .setPlaceholder('Selecionar uma pergunta...')
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