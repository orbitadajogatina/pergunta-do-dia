const sendCore = require('../core/sendCore');

async function sendNow (interaction) {
  const userID = interaction.user.id;
  if (userID !== interaction.message.interaction?.user.id) return;
  
  interaction.update({content: '**Tá bom.** Enviando pergunta agora.', components: [], embeds: []});
  const questionID = interaction.customId.split('_')[2];
  const chosenQuestion = (await database.from('questions').select().eq('id', questionID)).data[0];
  sendCore.sendQuestion(chosenQuestion);
}

module.exports = { sendNow }