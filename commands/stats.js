const { SlashCommandBuilder } = require('discord.js');
const moment = require('moment-timezone');
const bot = global.bot;
const database = global.database;

const properties = new SlashCommandBuilder()
  .setName('estatísticas')
  .setDescription('Visualizar quantidade e outros dados sobre perguntas e autores.')
  .addSubcommand(subcommand =>
      subcommand
        .setName('perguntas')
        .setDescription('Ver quantidade de perguntas em cada estado e previsões.'))
  .addSubcommand(subcommand =>
    subcommand
      .setName('autores')
      .setDescription('Ver ranking de autores com mais perguntas.'));

async function execute(interaction) {
  const chosenType = interaction.options._subcommand;

  const questions = database.from('questions');

  if (chosenType == 'perguntas') {
    await interaction.deferReply();

    const questionsData = (await questions.select('status')).data; // , { count: 'exact' }
  
    const approvedQuestionsLength = questionsData.filter(question => question.status == 2).length;
    const sentQuestionsLength = questionsData.filter(question => question.status == 3).length;
    const declinedQuestionsLength = questionsData.filter(question => question.status == 1).length;
    const inReviewQuestionsLength = questionsData.filter(question => question.status == 0).length;
    const daysPrediction = moment.tz(moment(), 'America/Sao_Paulo').add(approvedQuestionsLength, 'days').set({'hour': 12, 'minute': 0, 'second': 0}).unix();

    interaction.editReply(`✅ • **${approvedQuestionsLength}** perguntas estão **aprovadas** e na fila de envio. — ${approvedQuestionsLength > 0 ? `Tem pergunta até <t:${daysPrediction}:D>.` : '💀 Tamo sem pergunta.'}
☑️ • **${sentQuestionsLength}** perguntas já foram **enviadas**.
❌ • **${declinedQuestionsLength}** perguntas foram **negadas**.
⌛ • **${inReviewQuestionsLength}** perguntas estão **em revisão**.`);
  } else if (chosenType == 'autores') {
    await interaction.deferReply();

    const questionsData = (await questions.select('author')).data;
    
    const counts = questionsData.reduce((acc, item) => {
      const author = item.author;
      acc[author] = (acc[author] || 0) + 1;
      return acc;
    }, {});
    
    const ranking = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const rankingAsString = (await Promise.all(ranking.map(async ([author, count], index) => `${index < 3 ? '**' : ``}${index + 1}º - ${(await bot.users.fetch(author)).username} (${count} pergunta${count == 1 ? '' : 's'})${index < 3 ? '**' : ''}`))).join('\n');
    
    interaction.editReply(rankingAsString);
  }
}

module.exports = { properties, execute };