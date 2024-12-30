const gis = require('async-g-i-s');
const Jimp = require('jimp');
const axios = require('axios');
const DiscordEmojis = require('discord-emojis-parser');
let numberedListEmojiCount = -1;

async function emojiFromURL(urls) {
  if (urls.length < 1) throw {from: 'user', content: '**Eita.** Erro ao criar emoji com base em imagem. (length = 0)'};
  let chosenUrls = [];
  
  for (let index = 0; index < urls.length; index++) {
    const currentUrl = urls[index];
    
    try {
      const image = await Jimp.read(currentUrl);
      
      const compressedImage = await image.resize(image.getWidth() / 4, image.getHeight() / 4).autocrop().getBufferAsync('image/png');
      
      if (compressedImage.byteLength / 1024 <= 256) {
        chosenUrls.push(currentUrl);
      } else if (compressedImage.byteLength / 1024 > 256 && urls.length == 1) {
        throw {from: 'user', content: '**Que isso hein, rapaz!** Você usou uma imagem muito grande para criar um emoji. Escolha uma menor 🤏.'};
      }

      if (chosenUrls.length == 3) break;
    } catch (err) {
      if (urls.length == 1 && err.toString().includes('Could not find MIME')) {
        throw {from: 'user', content: `**Se liga, hein.** Parece que você não colocou o URL de uma imagem válida para criar um emoji. (${currentUrl}))\n${err}`};
      } else if (urls.length == 1) {
        throw err;
      } else {
        continue;
      }
    }
  }
  
  return `$[Imagem](${chosenUrls[Math.floor(Math.random() * (chosenUrls > 3 ? 3 : chosenUrls.length))]})$`;
}

function numberedListEmoji () {
  const emojisCode = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯']; // 20
  numberedListEmojiCount++;
  return emojisCode[numberedListEmojiCount];
}

async function parseEmojis (emoji, text, index) {
  const forcedEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯', '🇰', '🇱', '🇲', '🇳', '🇴', '🇵', '🇶', '🇷', '🇸', '🇹', '🇺', '🇻', '🇼', '🇽', '🇾', '🇿'];
  const nativeEmoji = DiscordEmojis.parse(emoji)[0];
  const serverEmoji = emoji.match(/^<a?:.+?:\d{18}>/u);
  const makeEmoji = emoji.match(/^\$(.*?)\$/);
  
  if (makeEmoji) { // url, termo, pesquisa => emoji
    try {
      const searchOptions = {
        "tbs": "ic:trans"
      };
      const makeEmojiInput = makeEmoji[1];
      let emojiURL;

      if (!makeEmojiInput) {
        const gisSearch = await gis(text, {query: searchOptions});
        emojiURL = gisSearch.map(result => result.url).filter(url => url.endsWith('.png'));
      } else if (makeEmojiInput.startsWith('http') || makeEmojiInput.startsWith('https')) {
        emojiURL = [makeEmojiInput];
      } else if (makeEmojiInput) {
        const gisSearch = await gis(makeEmojiInput, {query: searchOptions});
        emojiURL = gisSearch.map(result => result.url).filter(url => url.endsWith('.png'));
      }

      return emojiFromURL(emojiURL);
    } catch (err) {
      throw err;
    }
  } else if (serverEmoji) { // emoji de servidor
    return serverEmoji[0];
  } else if (nativeEmoji || forcedEmojis.includes(emoji)) { // emoji nativo 
    return nativeEmoji?.unicode || emoji;
  } else if (emoji === '##') { // enumerar
    return numberedListEmoji();
  } else {
    throw {from: 'user', content: `**Hmmm...** Parece que **"${emoji}"** não é um emoji válido. Dá uma olhada no comando \`/emojis\` para mais informações.`}
  }
}

async function parseOptions (textOptions) {
  const arrayOptions = textOptions.split('\n').filter(option => option).splice(0, 20);
  let formattedArrayOptions = [];
  numberedListEmojiCount = -1;
  
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
  
  if (hasDuplicateEmoji) throw {from: 'user', content: '**Mano,** você botou emojis duplicados.'};
  if (hasDuplicateText) throw {from: 'user', content: '**Mano,** você fez opções duplicadas.'};
  if (formattedArrayOptions.length < 2) throw {from: 'user', content: `**Se liga, hein.** Você não formatou corretamente as opções e/ou os emojis ou apenas inseriu uma (mínimo é 2; máximo é 20).\n\nSempre use \`Emoji - Texto\`. Saiba mais sobre emojis no comando \`/emojis\`.`};

  return formattedArrayOptions;
}

async function parseImage (url, questionQuestion) {
  if (!url) return null;
  
  const searchImage = url.match(/^\$(.*?)\$/);
  if (searchImage) {
    const searchImageInput = searchImage[1];

    if (searchImageInput.startsWith('http') || searchImageInput.startsWith('https')) {
      url = searchImageInput;
    } else {
      const gisSearch = await gis(searchImageInput || questionQuestion);
      const results = gisSearch.map(result => result.url).slice(0, 5);
      url = results[Math.floor(Math.random() * results.length)];
    }
  } else {
    const imageContent = await axios.get(url, { responseType: 'stream' });
    const contentType = imageContent.headers['content-type'];
    if (!contentType.startsWith('image')) throw {from: 'user', content: `**Sério?** O link da imagem não é uma imagem! Verifique o link antes de usar no bot.`};
  }

  return url;
}

module.exports = {parseOptions, parseImage}