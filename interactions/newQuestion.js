const { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const transformQuestionsDataToEmbed = require('../core/transformQuestionsDataToEmbed');
const parseOptions = require('../core/parseOptions');

const database = global.database;
const bot = global.bot;

async function execute (interaction) {
  await interaction.deferReply();
  
  const userID = interaction.user.id;
  const userIsAdmin = userID == '668199172276748328' || interaction.member?.permissions.has([PermissionsBitField.Flags.Administrator]) || false;
  const fields = interaction.fields;
  
  const arrayOptions = await parseOptions(fields.getTextInputValue('options'));
  if (arrayOptions.length < 2) throw `Se liga, hein. Você não formatou corretamente as opções e/ou os emojis ou apenas inseriu uma (mínimo é 2; máximo é 20).\n\nSempre use \`Emoji - Texto\`. Saiba mais sobre emojis no comando \`/emojis\`.`;

  const newQuestionObject = {
    question: fields.getTextInputValue('question'),
    options: arrayOptions,
    description: fields.getTextInputValue('description'),
    footer: fields.getTextInputValue('footer'),
    image: /^https?:\/\/.*\.(jpeg|jpg|gif|png)(\?.*)?$/i.test(fields.getTextInputValue('image')) ? fields.getTextInputValue('image') : null,
    author: userID,
    status: userIsAdmin ? 2 : 0 // 0 => Aguardando; 1 => Recusado; 2 => Aprovado; 3 => Enviada.
  };
  
  const questions = database.from('questions');
  questions.insert(newQuestionObject).select().then(async res => {
    if (res.error) throw res;
    
    const nextStep = userIsAdmin ? 'será enviada sabe-se lá quando.' : 'será analisada. Fique de olho na DM para saber se ela foi aceita ou não. Você também pode usar `/minhas-perguntas` para rever suas perguntas.'
    interaction.editReply(`**Show de bola!** Sua pergunta foi criada e ${nextStep}`);

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

      (await bot.channels.fetch(process.env.MANAGE_CHANNEL_ID)).send({content: '**Nova pergunta!**', embeds: [embed], components: [buttons]});
    }
  });
}

module.exports = {execute}