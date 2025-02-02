const { SlashCommandBuilder } = require('discord.js');
const { makeMessageWithDropdownsAndButtons, questionsDataByCommand } = require('../core/chooseQuestion');

const properties = new SlashCommandBuilder()
  .setName('minhas-perguntas')
  .setDescription('Ver perguntas criadas por você.')
  .addStringOption(option =>
    option.setName('pergunta')
      .setDescription('Pesquise por texto em perguntas.')
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
  const questionsData = await questionsDataByCommand.viewQuestion(interaction);
  const options = interaction.options?.data;
  
  const messageWithDropdownsAndButtons = makeMessageWithDropdownsAndButtons(questionsData, 'chooseQuestion_viewQuestion', '**Ah.** Você ainda não criou perguntas ou as filtrou demais.', options);
  interaction.editReply(messageWithDropdownsAndButtons);
}

module.exports = { properties, execute, id: 'myQuestions' };