const fs = require('fs');
const util = require('util');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const gis = require('g-i-s');
const Jimp = require('jimp');
const transformQuestionsDataToEmbed = require('../core/transformQuestionsDataToEmbed');

const database = global.database;
const bot = global.bot;

async function emojiFromUrl(urls) {
  let chosenUrls = [];
  
  for (let index = 0; index < urls.length; index++) {
    const currentUrl = urls[index];
    
    try {
      const image = await Jimp.read(currentUrl);
      
      const compressedImage = await image.resize(image.getWidth() / 4, image.getHeight() / 4).autocrop().getBufferAsync('image/png');
      
      if (compressedImage.byteLength / 1024 <= 256) {
        chosenUrls.push(currentUrl);
      } else if (compressedImage.byteLength / 1024 > 256 && urls.length == 1) {
        throw 'Imagem muito grande. Escolha uma menor.';
      }

      if (chosenUrls.length == 3) break;
    } catch (err) {
      if (urls.length == 1 && err.toString().includes('Could not find MIME')) {
        throw `Link não é uma imagem. Verifique o link antes de usar no bot.\n${err}`;
      } else if (!err.toString().includes('Could not find MIME')) {
        throw err;
      }
    }
  }
  
  return `$[Imagem](${chosenUrls[Math.floor(Math.random() * (chosenUrls > 3 ? 3 : chosenUrls.length))]})$`;
}

function numberedListEmoji (index) {
  const emojisCode = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯']; // 20
  return emojisCode[index];
}

async function parseEmojis (emoji, text, index) {
  const nativeEmoji = emoji.match(/^<a?:.+?:\d{18}>|^\p{Emoji_Presentation}/u);
  const url = emoji.match(/^\$(.*?)\$/);
  
  if (url) { // url => emoji
    try {
      return emojiFromUrl(url[1] ? [url[1]] : (await util.promisify(gis)({ searchTerm: text + ' png', queryStringAddition: '&hl=pt-BR&tbs=ic:trans'})).map(result => result.url).filter(url => url.endsWith('.png')));
    } catch (err) {
      throw err;
    }
  } else if (nativeEmoji) { // emoji nativo ou de servidor
    return nativeEmoji[0];
  } else if (emoji == '##') { // enumerar
    return numberedListEmoji(index);
  } else {
    throw 'Parece que você não digitou um emoji válido. Dá uma olhada no comando /emojis para mais informações.'
  }
}

async function parseOptions (textOptions) {
  const arrayOptions = textOptions.split('\n').filter(option => option).splice(0, 20);
  if (arrayOptions.length < 2) return [undefined];
  let formattedArrayOptions = [];
  
  for (let index = 0; index < arrayOptions.length; index++) {
    const option = arrayOptions[index];
    const element = option.match(/(.*?) - (.*)/);
    
    if (element) {
      formattedArrayOptions.push({
        emoji: await parseEmojis(element[1], element[2], index),
        text: element[2]
      });
    }
  }
  
  return formattedArrayOptions;
}

async function execute (interaction) {
  await interaction.deferReply();
  
  const userID = interaction.user.id;
  const userIsAdmin = userID == '668199172276748328' || interaction.member.permissions.has([PermissionsBitField.Flags.Administrator]);
  const fields = interaction.fields;
  
  const arrayOptions = await parseOptions(fields.getTextInputValue('options'));
  if (!arrayOptions[0]) {
    interaction.editReply(`**Se liga, hein.** Você não formatou corretamente as opções e/ou os emojis ou apenas inseriu uma (mínimo é 2; máximo é 20).\n\nSempre use \`Emoji - Texto\`. Saiba mais sobre emojis no comando \`/emojis\`.\n\nSeu rascunho:\n${fields.fields.map(field => `${field.customId}: \`${field.value ? field.value : '-'}\``).join('\n')}`);
  } else {
    const newQuestionObject = {
      question: fields.getTextInputValue('question'),
      options: arrayOptions,
      description: fields.getTextInputValue('description'),
      footer: fields.getTextInputValue('footer'),
      author: userID,
      status: userIsAdmin ? 2 : 0 // 0 => Aguardando; 1 => Recusado; 2 => Aprovado.
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
              .setCustomId(`setQuestionStatus_accept_${res.data[0].id}`)
              .setLabel('Aceitar')
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
            .setCustomId(`setQuestionStatus_refuse_${res.data[0].id}`)
            .setLabel('Negar')
            .setStyle(ButtonStyle.Danger)
          );

        (await bot.channels.fetch(process.env.MANAGE_CHANNEL_ID)).send({content: '**Nova pergunta!** Cuidado. Cada clique no botão significa uma mensagem na DM do autor.', embeds: [embed], components: [await buttons]});
      }
    });
  }
}

module.exports = {execute}
