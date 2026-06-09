const { SlashCommandBuilder } = require('discord.js');

const properties = new SlashCommandBuilder()
  .setName('fila')
  .setDescription('Veja os autores que ainda estão na fila de envio de perguntas.');

async function execute(interaction) {
  const { data: queue } = await database.rpc('get_queue');
  const lastQuestionsAuthors = JSON.parse((await database.from('variables').select().eq('key', 'lastQuestionsAuthors')).data[0]?.value || '[]');

  let skipQueueAsString = "";
  const { data: skipQueue } = await database.from('queue').select().order('amount', { ascending: false }).order('created_at', { ascending: true });;
  if (skipQueue.length > 0) {
    const skipQueueLines = await Promise.all(
      skipQueue.map(async (e) => {
        const user = await bot.users.fetch(e.user_id);
        return `${user.username} (${e.amount / 100} Azeitonas)`;
      })
    );
    skipQueueAsString = `### Usuários que furaram a fila:\n${skipQueueLines.join('\n')}\n### Fila normal:\n`;
  }

  const queueAsString = (await Promise.all(
                        queue
                          .map(async author => (lastQuestionsAuthors.includes(author) ? '✅ ' : '❌ ') + (await bot.users.fetch(author)).username)))
                          .sort(author => author.startsWith('✅') ? -1 : 1)
                          .join('\n');

  await interaction.reply(skipQueueAsString + queueAsString);
}

module.exports = { properties, execute, id: 'queue' };