const moment = require('moment-timezone');
const transformQuestionsDataToEmbed = require('../core/transformQuestionsDataToEmbed');
const { checkAndParseQuestion } = require('../core/questionManager');
const axios = require('axios');
const Jimp = require('jimp');

let lastQuestionsAuthors = [];

async function chooseQuestion () {
  const questionsData = (await database.from('questions').select().eq('status', 2).is('sentAt', null)).data;
  const filteredQuestions = questionsData.filter(e => !lastQuestionsAuthors.includes(e.author));
  if (filteredQuestions.length == 0) {
    lastQuestionsAuthors = [];
    lastQuestionsAuthors = questionsData;
  }
  const luckNumber = Math.floor(Math.random() * questionsData.length);
  const chosenQuestion = questionsData[0] ? questionsData[luckNumber] : await generateQuestion();
  lastQuestionsAuthors.push(chosenQuestion.author);

  return chosenQuestion;
}

async function generateQuestion() {
  // question, options, description, footer, image, author, status
  //console.log(checkAndParseQuestion(`Você já ?`, `👍 - Sim, eu já .\n👎 - Não, eu nunca .`, description, footer, image, author, status));
  console.log('fabricar pergunta');
}

async function makeEmojisAndTransformText(question) {
  const options = question.options;
  const emojiStorageGuild = await bot.guilds.fetch(process.env.EMOJI_GUILD_ID);
  let emojisToDelete = Array.from(emojiStorageGuild.emojis.cache).map(emoji => emoji[1]).filter(emoji => !emoji.name.startsWith(`q${question.id}`));
  let optionsWithEmojisIDs = [];
  
  for (let index = 0; index < options.length; index++) {
    let currentOption = options[index];
    if (currentOption.emoji[0] != '$') {
      optionsWithEmojisIDs.push(currentOption);
    } else {
      try {
        const image = await Jimp.read(currentOption.emoji.match(/\$\[Imagem\]\((.*?)\)\$/)[1]);
        const compressedImage = await image.resize(image.getWidth() / 4, image.getHeight() / 4).autocrop().getBufferAsync('image/png');
        const emoji = await emojiStorageGuild.emojis.create({ attachment: compressedImage, name: `q${question.id}_o${index}` });
        currentOption.emoji = `<:q${question.id}_o${index}:${emoji.id}>`;
        optionsWithEmojisIDs.push(currentOption);
      } catch (err) {
        throw `pergunta ${question.id}, opção ${index}, ${err}`;
      }
    }

    try {
      if (emojisToDelete[0]) await (emojisToDelete.shift()).delete();
    } catch (err) {
      console.error(err, 'Deletar emoji')
    }
  }

  return optionsWithEmojisIDs;
}

async function addOptionsAsReaction(message, options) {
  for (let index = 0; index < options.length; index++) {
    const currentOption = options[index];
    await message.react(currentOption.emoji);
  }
}

async function sendQuestion (question) {
  question.options = await makeEmojisAndTransformText(question);
  let message;

  try {
    const embed = transformQuestionsDataToEmbed(question, false);
    const channel = await bot.channels.fetch(process.env.QUESTIONS_CHANNEL_ID) || await bot.channels.cache.get(process.env.QUESTIONS_CHANNEL_ID);
    message = await channel.send({content: `<@&${process.env.ROLE_ID}>`, embeds: [embed]});
    await addOptionsAsReaction(message, question.options);
    const thread = await message.startThread({
      name: 'Discussão',
      autoArchiveDuration: 60
    });
    thread.send(`de: <@${question.author}>`);

    const sentAt = moment.tz(moment(), 'America/Sao_Paulo').format();
    await database.from('questions').update({sentAt: sentAt, status: 3, messageID: message.id}).eq('id', question.id);
  } catch (err) {
    message?.delete();
    throw `pergunta ${question.id}, ${err}`;
  }
}

async function main () {
  sendQuestion(await chooseQuestion());
}

function runCron () {
  const CronJob = require('cron').CronJob;
  
  new CronJob('0 12-20 * * *', () => {
    database.from('questions').select('sentAt').gte('sentAt', moment.tz(moment(), 'America/Sao_Paulo').format('YYYY-MM-DD')).then(res => {
      if (res.data.length == 0) {
        main();
      }
    }).catch(err => {
      console.error(err, 'cron');
    });
  }, null, true, 'America/Sao_Paulo');
}

module.exports = { main, sendQuestion, runCron };
