const util = require('util');
const gis = require('g-i-s');
const Jimp = require('jimp');
const DiscordEmojis = require('discord-emojis-parser');

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
  const nativeEmoji = DiscordEmojis.parse(emoji)[0];
  const serverEmoji =  emoji.match(/^<a?:.+?:\d{18}>/u);
  const url = emoji.match(/^\$(.*?)\$/);
  
  if (url) { // url => emoji
    try {
      return emojiFromUrl(url[1] ? [url[1]] : (await util.promisify(gis)({ searchTerm: text + ' png', queryStringAddition: '&hl=pt-BR&tbs=ic:trans'})).map(result => result.url).filter(url => url.endsWith('.png')));
    } catch (err) {
      throw err;
    }
  } else if (serverEmoji) { // emoji de servidor
    return serverEmoji[0];
  } else if (nativeEmoji) { // emoji nativo 
    return nativeEmoji.unicode;
  } else if (emoji == '##') { // enumerar
    return numberedListEmoji(index);
  } else {
    throw 'Parece que você não digitou um emoji válido. Dá uma olhada no comando /emojis para mais informações.'
  }
}

module.exports = async function parseOptions (textOptions) {
  const arrayOptions = textOptions.split('\n').filter(option => option).splice(0, 20);
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

  const hasDuplicateEmoji = formattedArrayOptions.some((item, index, array) => {
    return array.filter((item2, index2) => {
      return item.emoji === item2.emoji && index !== index2;
    }).length > 0;
  });
  
  const hasDuplicateText = formattedArrayOptions.some((item, index, array) => {
    return array.filter((item2, index2) => {
      return item.text === item2.text && index !== index2;
    }).length > 0;
  });
  
  if (hasDuplicateEmoji) throw 'Mano, você botou emojis duplicados.';
  if (hasDuplicateText) throw 'Mano, você fez opções duplicadas.';
  return formattedArrayOptions;
}