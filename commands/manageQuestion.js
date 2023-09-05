const { SlashCommandBuilder } = require('discord.js');
const { makeMessageWithDropdownsAndButtons, questionsDataByCommand } = require('../core/chooseQuestion');

const properties = new SlashCommandBuilder()
  .setName('gerenciar')
  .setDescription('Editar ou apagar uma pergunta sua ainda não enviada ou enviada nas últimas 24h.')
  .addStringOption(option =>
    option.setName('pergunta')
      .setDescription('Pesquise por texto em perguntas, descrições e rodapés.')
      .setRequired(false))
  .addIntegerOption(option =>
    option.setName('situação')
      .setDescription('Filtre pela situação das perguntas.')
      .setRequired(false)
      .addChoices(
        { name: 'Aprovadas', value: 2 },
        { name: 'Enviadas', value: 3 },
        { name: 'Recusadas', value: 1 },
        { name: 'Em análise', value: 0 }
      ));

async function execute (interaction) {
  await interaction.deferReply();
  const questionsData = await questionsDataByCommand.manageQuestion(interaction);
  const options = interaction.options?.data;
  
  const messageWithDropdownsAndButtons = makeMessageWithDropdownsAndButtons(questionsData, 'chooseQuestion_manageQuestion', '**Ah.** Você não tem perguntas para gerenciar.', options);
  interaction.editReply(messageWithDropdownsAndButtons);
}

module.exports = { properties, execute, id: 'manageQuestion' };