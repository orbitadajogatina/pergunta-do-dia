const { makeMessageWithDropdownsAndButtons, questionsDataByCommand } = require('../core/chooseQuestion');
const { wasSentInTheLast24Hours } = require('../core/questionManager')
const transformQuestionsDataToEmbed = require('../core/transformQuestionsDataToEmbed');

async function deleteQuestion (interaction) {
  const userID = interaction.user.id;
  if (userID !== interaction.message.interaction?.user.id) return;
  
  await interaction.deferReply();

  if (wasSentInTheLast24Hours(interaction.message.embeds[0])) {
    interaction.editReply('**Opa!** Essa pergunta já foi enviada! Agora já não dá mais pra apagar.');
    return;
  }

  const dataOnId = interaction.customId.split('_');
  const questionID = dataOnId[2];

  database.from('questions').delete().eq('id', questionID).select().then(async res => {
    if (res.error) throw res.error;

    const questionsData = await questionsDataByCommand.manageQuestion(interaction);
    const messageWithDropdownsAndButtons = makeMessageWithDropdownsAndButtons(questionsData, 'chooseQuestion_manageQuestion', '**Ah.** Você não tem perguntas para gerenciar.');
    await interaction.message.edit(messageWithDropdownsAndButtons);

    await interaction.editReply({content: '**Ela partiu...** Essa questão foi apagada com sucesso!', embeds: [transformQuestionsDataToEmbed(res.data[0], true)]});
  });
}

module.exports = {deleteQuestion}