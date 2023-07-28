const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const sendCore = require('../core/sendCore');
const { makeMessageWithDropdownsAndButtons, questionsDataByCommand } = require('../core/chooseQuestion');

const properties = new SlashCommandBuilder()
  .setName('forçar-envio')
  .setDescription('Forçar o envio de uma pergunta.')
  .setDefaultMemberPermissions(0)
  .addSubcommand(subcommand =>
      subcommand
        .setName('aleatório')
        .setDescription('Enviar uma pergunta aleatória.'))
  .addSubcommand(subcommand =>
    subcommand
      .setName('específico')
      .setDescription('Escolher uma pergunta.'))
  .setDMPermission(false);

async function execute (interaction) {
  const userIsAdmin = interaction.user.id == '668199172276748328' || interaction.member.permissions.has([PermissionsBitField.Flags.Administrator]);

  if (!userIsAdmin) {
    interaction.reply({content: '**Irmão, esqueça.** Você não é admin, não adianta.', ephemeral: true});
    return;
  }

  const chosenType = interaction.options._subcommand;
  if (chosenType == 'aleatório') {
    interaction.reply('**Tá bom.** Enviando pergunta agora.');
    sendCore.main();
  } else if (chosenType == 'específico') {
    await interaction.deferReply();
    const questionsData = await questionsDataByCommand.sendQuestion(interaction);
    const messageWithDropdownsAndButtons = makeMessageWithDropdownsAndButtons(questionsData, 'chooseQuestion_sendQuestion', '💀 Tamo sem pergunta.')
    interaction.editReply(messageWithDropdownsAndButtons);
  }
}

module.exports = { properties, execute, id: 'sendNow' };