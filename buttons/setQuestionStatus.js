const database = global.database;
const bot = global.bot;

async function execute (interaction, statusNumber) {
  await interaction.deferReply({ ephemeral: true });

  const statusText = ['Negada', 'Aceita'][statusNumber - 1];
  const message = interaction.message;
  const questionID = interaction.customId.split('_')[2];
  let embed = message.embeds[0].data;

  const questions = database.from('questions');
  questions.update({ status: statusNumber }).eq('id', questionID).select().then(async res => {
    if (res.error) throw res;

    embed.fields[0].value = statusText;
    message.edit({content: `Pergunta ${statusText.toLowerCase()} por <@${interaction.user.id}>. Cuidado. Cada clique no botão significa uma mensagem na DM do autor.`, embeds: [embed]});

    const authorDM = await bot.users.fetch(res.data[0].author);
    authorDM.send({content: `**${['Puxa...', 'Boa notícia!'][statusNumber - 1]}** Esta pergunta foi ${statusText.toLowerCase()}. ${statusNumber == 1 ? 'Quem sabe ela pode ser aceita se você reenviar alterando alguma coisa.' : ''}`, embeds: [embed]});

    interaction.deleteReply();
  });
}

async function accept (interaction) {
  execute(interaction, 2);
}

async function refuse (interaction) {
  execute(interaction, 1);
}

module.exports = {accept, refuse}