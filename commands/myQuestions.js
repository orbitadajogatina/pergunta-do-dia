const { SlashCommandBuilder } = require('discord.js');
const { makeMessageWithDropdownsAndButtons, questionsDataByCommand } = require('../core/chooseQuestion');

const properties = new SlashCommandBuilder()
  .setName('minhas-perguntas')
  .setDescription('Ver perguntas criadas por você.');

async function execute (interaction) {
  await interaction.deferReply();
  const questionsData = await questionsDataByCommand.viewQuestion(interaction);
  const messageWithDropdownsAndButtons = makeMessageWithDropdownsAndButtons(questionsData, 'chooseQuestion_viewQuestion', '**Ah.** Você ainda não criou perguntas.');
  interaction.editReply(messageWithDropdownsAndButtons);
}

module.exports = { properties, execute, id: 'myQuestions' };