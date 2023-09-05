const { SlashCommandBuilder } = require('discord.js');

const properties = new SlashCommandBuilder()
  .setName('fila')
  .setDescription('Veja os autores que ainda estão na fila de envio de perguntas.');

async function execute(interaction) {
  const { data: queue } = await database.rpc('get_queue');
  const lastQuestionsAuthors = JSON.parse((await database.from('variables').select().eq('key', 'lastQuestionsAuthors')).data[0]?.value || '[]');

  const queueAsString = (await Promise.all(
                        queue
                          .map(async author => (lastQuestionsAuthors.includes(author) ? '✅ ' : '❌ ') + (await bot.users.fetch(author)).username)))
                          .sort(author => author.startsWith('✅') ? -1 : 1)
                          .join('\n');

  await interaction.reply(queueAsString);
}

module.exports = { properties, execute, id: 'queue' };