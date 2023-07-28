const { SlashCommandBuilder } = require('discord.js');
const { makeMessageWithDropdownsAndButtons, questionsDataByCommand } = require('../core/chooseQuestion');

const properties = new SlashCommandBuilder()
  .setName('gerenciar')
  .setDescription('Editar ou apagar uma pergunta sua ainda não enviada ou enviada nas últimas 24h.');

async function execute (interaction) {
  await interaction.deferReply();
  const questionsData = await questionsDataByCommand.manageQuestion(interaction);
  const messageWithDropdownsAndButtons = makeMessageWithDropdownsAndButtons(questionsData, 'chooseQuestion_manageQuestion', '**Ah.** Você não tem perguntas para gerenciar.');
  interaction.editReply(messageWithDropdownsAndButtons);
}

module.exports = { properties, execute, id: 'manageQuestion' };