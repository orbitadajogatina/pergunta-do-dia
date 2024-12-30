const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { checkIfQuestionAlreadyExist, generateQuestion } = require('../core/sendCore');
const transformQuestionsDataToEmbed = require('../core/transformQuestionsDataToEmbed');

const properties = new SlashCommandBuilder()
  .setName('gerar-pergunta')
  .setDescription('Criar uma pergunta aleatória sobre filmes, desenhos ou jogos.')
  .setDefaultMemberPermissions(0)
  .setDMPermission(false);

async function execute (interaction) {
  const userIsAdmin = admins.includes(interaction.user.id);

  if (!userIsAdmin) {
    interaction.reply({content: '**Irmão, esqueça.** Você não é admin, não adianta.', ephemeral: true});
    return;
  }

  await interaction.deferReply();
  const generatedQuestion = await checkIfQuestionAlreadyExist(await generateQuestion());
  interaction.editReply({content: '**Aí sim!** Pergunta gerada com sucesso! Se quiser enviá-la agora, use o comando \`/forçar-envio específico\`.', embeds: [transformQuestionsDataToEmbed(generatedQuestion)]});
}

module.exports = { properties, execute, id: 'generateQuestion' };