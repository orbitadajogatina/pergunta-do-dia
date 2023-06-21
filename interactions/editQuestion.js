const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { selectQuestionToEdit } = require('../interactions/chooseQuestionToEdit');
const transformQuestionsDataToEmbed = require('../core/transformQuestionsDataToEmbed');
const parseOptions = require('../core/parseOptions');
const database = global.database;

async function newValueOfField (changedField, fields) {
  switch (changedField) {
    case 'options':
      const arrayOptions = await parseOptions(fields.getTextInputValue('options'));
      if (arrayOptions.length < 2) return undefined;
      return arrayOptions;
    case 'image': 
      return /^https?:\/\/.*\.(jpeg|jpg|gif|png)(\?.*)?$/i.test(fields.getTextInputValue('image')) ? fields.getTextInputValue('image') : null;
    default:
      return fields.getTextInputValue(changedField);
  }
}

async function execute (interaction) {
  await interaction.deferReply();
  
  const userID = interaction.user.id;
  const userIsAdmin = userID == '668199172276748328' || interaction.member?.permissions.has([PermissionsBitField.Flags.Administrator]) || false;

  const fields = interaction.fields;
  const infoOnId = interaction.customId.split('_');
  const changedField = infoOnId[2];
  const questionID = infoOnId[3];

  let changedQuestionObject = { status: userIsAdmin ? 2 : 0 }; // 0 => Aguardando; 1 => Recusado; 2 => Aprovado; 3 => Enviada.
  const newValue = await newValueOfField(changedField, fields);
  if (newValue === undefined) throw `Se liga, hein. Você não formatou corretamente as opções e/ou os emojis ou apenas inseriu uma (mínimo é 2; máximo é 20).\n\nSempre use \`Emoji - Texto\`. Saiba mais sobre emojis no comando \`/emojis\`.`;
  changedQuestionObject[changedField] = newValue;

  const questions = database.from('questions');
  questions.update(changedQuestionObject).eq('id', questionID).select().then(async res => {
    if (res.error) throw res;

    interaction.message.edit(await selectQuestionToEdit(questionID, userID));

    const nextStep = userIsAdmin ? 'será enviada sabe-se lá quando.' : 'será analisada. Fique de olho na DM para saber se ela foi aceita ou não. Você também pode usar `/minhas-perguntas` para rever suas perguntas.';
    interaction.editReply(`**Bão demais!** Sua pergunta foi editada e ${nextStep}`);

    if (!userIsAdmin) {
      const embed = transformQuestionsDataToEmbed(res.data[0], true);
      const buttons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`setQuestionStatus_approve_${res.data[0].id}`)
            .setLabel('Aprovar')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId(`setQuestionStatus_decline_${res.data[0].id}`)
            .setLabel('Recusar')
            .setStyle(ButtonStyle.Danger)
        );

      (await bot.channels.fetch(process.env.MANAGE_CHANNEL_ID)).send({content: '**Uma pergunta foi editada!**', embeds: [embed], components: [buttons]});
    }
  });
}

module.exports = {execute}