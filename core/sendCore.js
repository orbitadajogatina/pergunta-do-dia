const moment = require('moment-timezone');
const transformQuestionsDataToEmbed = require('../core/transformQuestionsDataToEmbed');
const { checkAndParseQuestion } = require('../core/questionManager');
const axios = require('axios');
const FormData = require('form-data');
const { JSDOM } = require('jsdom');
const Jimp = require('jimp');

async function chooseQuestion () {
  let lastQuestionsAuthors = JSON.parse((await database.from('variables').select().eq('key', 'lastQuestionsAuthors')).data[0]?.value || '[]');

  const { data: questionsData } = await database.from('questions').select().eq('status', 2).is('sentAt', null);
  let filteredQuestions = questionsData.filter(question => !lastQuestionsAuthors.includes(question.author));
  if (filteredQuestions.length == 0) {
    lastQuestionsAuthors = [];
    filteredQuestions = questionsData;
  }
  
  const luckNumber = Math.floor(Math.random() * filteredQuestions.length);
  const chosenQuestion = filteredQuestions[0] ? filteredQuestions[luckNumber] : await checkIfQuestionAlreadyExist(await generateQuestion());
  
  lastQuestionsAuthors.push(chosenQuestion.author);
  await database.from('variables').upsert({ key: 'lastQuestionsAuthors', value: JSON.stringify(lastQuestionsAuthors) });

  return chosenQuestion;
}

async function checkIfQuestionAlreadyExist(question) {
  let approvedQuestion = false;
  do {
    const { data } = await database.from('questions').select('question').eq('question', question.question);
    if (data.length > 0) {
      // console.log('recusado', question.question)
      question = await generateQuestion();
    } else {
      approvedQuestion = true;
    }
  } while (approvedQuestion == false);
  
  const { error, data: newQuestion } = await database.from('questions').insert(question).select();
  if (error) throw error;
  // console.log('aprovado', newQuestion[0].question)
  return newQuestion[0];
}

async function generateQuestion() {
  const contentTypesData = [
    {
      name: 'games',
      portugueseVerbForQuestion: 'jogou',
      portugueseVerbForOption: 'joguei',
      url: 'https://randommer.io/random-games',
      body: {
        quantity: ['1'],
        platforms: [
          '137', '37', '20', '159', '130', '8', '9', '48', '167', '5', '41', '12', '36', '49', '169'
        ]
      }
    },
    {
      name: 'movies',
      portugueseVerbForQuestion: 'assistiu',
      portugueseVerbForOption: 'assisti',
      url: 'https://randommer.io/random-movies',
      body: {
        quantity: ['1'],
        language: ['en'],
        year: ['2010']
      }
    },
    {
      name: 'cartoons',
      portugueseVerbForQuestion: 'assistiu',
      portugueseVerbForOption: 'assisti',
      url: 'https://randommer.io/random-shows',
      body: {
        quantity: ['1'],
        genres: ['16']
      }
    }
  ];
  const luckNumber = Math.floor(Math.random() * contentTypesData.length);
  const chosenContentType = contentTypesData[luckNumber];

  let requestBody = new FormData();
  for (let i = 0; i < Object.keys(chosenContentType.body).length; i++) {
    const currentBodyKey = Object.keys(chosenContentType.body)[i];
    const currentBodyValues = chosenContentType.body[currentBodyKey]
    
    for (let j = 0; j < currentBodyValues.length; j++) {
      requestBody.append(currentBodyKey, currentBodyValues[j]);
    }
  }

  const requestConfig = {
    method: 'post',
    maxBodyLength: Infinity,
    url: chosenContentType.url,
    headers: { 
      'X-API-KEY': 'ddaefc4e08f54f8aa555e2e73ab3d075',
      ...requestBody.getHeaders()
    },
    data: requestBody
  };

  try {
    const response = await axios.request(requestConfig);
    const { document } = (new JSDOM(response.data)).window;
    
    const contentTitle = document.querySelector('div.caption > p').textContent;
    const contentCover = 'https://randommer.io' + document.querySelector('picture > source').getAttribute("srcset").replace('webp', 'jpg');

    // question, options, description, footer, image, author, status
    const question = await checkAndParseQuestion(`Você já ${chosenContentType.portugueseVerbForQuestion} ${contentTitle}?`, `👍 - Sim, eu já ${chosenContentType.portugueseVerbForOption}.\n👎 - Não, eu nunca ${chosenContentType.portugueseVerbForOption}.`, '', '', contentCover, '1050787722077409331', 2);
    return question;
  } catch (error) {
    throw `error ao gerar pergunta, ${error}`;
  }
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
    return await database.from('questions').update({sentAt: sentAt, status: 3, messageID: message.id}).eq('id', question.id).select().single();
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
  
  new CronJob('0 12-20 * * *', async () => {
    try {
      global.admins = await global.getAdmins();
    } catch (err) {
      console.error(err, 'cron-get-admins')
    }
    database.from('questions').select('sentAt').gte('sentAt', moment.tz(moment(), 'America/Sao_Paulo').format('YYYY-MM-DD')).then(res => {
      if (res.data.length == 0) {
        main();
      }
    }).catch(err => {
      console.error(err, 'cron');
    });
  }, null, true, 'America/Sao_Paulo');
}

module.exports = { main, runCron, sendQuestion, checkIfQuestionAlreadyExist, generateQuestion };