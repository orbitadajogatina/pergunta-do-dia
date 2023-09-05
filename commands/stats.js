const { SlashCommandBuilder } = require('discord.js');
const moment = require('moment-timezone');

const properties = new SlashCommandBuilder()
  .setName('estatísticas')
  .setDescription('Visualizar quantidade e outros dados sobre perguntas e autores.')
  .addSubcommand(subcommand =>
      subcommand
        .setName('perguntas')
        .setDescription('Ver quantidade de perguntas em cada situação e previsões.'))
  .addSubcommand(subcommand =>
    subcommand
      .setName('autores')
      .setDescription('Ver ranking de autores com mais perguntas.')
      .addIntegerOption(option =>
        option.setName('situação')
          .setDescription('Filtre o ranking pela situação das perguntas.')
          .setRequired(false)
          .addChoices(
            { name: 'Aprovadas', value: 2 },
            { name: 'Enviadas', value: 3 },
            { name: 'Recusadas', value: 1 },
            { name: 'Em análise', value: 0 }
          ))
  );

  async function execute(interaction) {
  const chosenType = interaction.options._subcommand;

  if (chosenType == 'perguntas') {
    await interaction.deferReply();

    const { data: questionsData } = await database.from('questions').select('status'); // , { count: 'exact' }
  
    const approvedQuestionsLength = questionsData.filter(question => question.status == 2).length;
    const sentQuestionsLength = questionsData.filter(question => question.status == 3).length;
    const declinedQuestionsLength = questionsData.filter(question => question.status == 1).length;
    const inReviewQuestionsLength = questionsData.filter(question => question.status == 0).length;
    const daysPrediction = moment.tz(moment(), 'America/Sao_Paulo').add(approvedQuestionsLength, 'days').set({'hour': 12, 'minute': 0, 'second': 0}).unix();

    interaction.editReply(`✅ • **${approvedQuestionsLength}** perguntas estão **aprovadas** e na fila de envio. — ${approvedQuestionsLength > 0 ? `Tem pergunta até <t:${daysPrediction}:D>.` : '💀 Tamo sem pergunta.'}
☑️ • **${sentQuestionsLength}** perguntas já foram **enviadas**.
❌ • **${declinedQuestionsLength}** perguntas foram **recusadas**.
⌛ • **${inReviewQuestionsLength}** perguntas estão **em análise**.`);
  } else if (chosenType == 'autores') {
    await interaction.deferReply();

    const status = interaction.options.getInteger('situação');
    const { data: questionsData } = await database.from('questions').select('author,status').match(status !== null ? {status} : {});
    
    const counts = questionsData.reduce((acc, item) => {
      const author = item.author;
      acc[author] = (acc[author] || 0) + 1;
      return acc;
    }, {});
    
    const ranking = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const rankingAsString = (await Promise.all(ranking.map(async ([author, count], index) => `${index < 3 ? '**' : ``}${index + 1}º - ${(await bot.users.fetch(author)).username} (${count} pergunta${count == 1 ? '' : 's'})${index < 3 ? '**' : ''}`))).join('\n');
    
    if (!rankingAsString) {
      interaction.editReply('Sem perguntas nessa situação.');
      return;
    }
    
    const statusTitle = ['⌛ • Em análise', '❌ • Recusadas', '✅ • Aprovadas', '☑️ • Enviadas'];
    interaction.editReply(`${status ? `**${statusTitle[status]}**\n\n` : ''}${rankingAsString}`);
  }
}

module.exports = { properties, execute, id: 'stats' };