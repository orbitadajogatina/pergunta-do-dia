const { checkAndParseQuestion, reviewQuestion, searchForSimilarQuestions } = require('../core/questionManager');
const moment = require('moment-timezone');
const { editQuestionAlreadySent } = require('../interactions/editQuestion');

// GET: Obter uma pergunta específica pelo ID
// inicie com _ para usar a messageID
async function get(req, res, authorization) {
  const id = req.params.id.toString();

  const { data: question } = await database.from('questions').select().eq((id.startsWith('_') ? 'messageID' : 'id'), id.replace('_', '')).single();
  if (!question) throw {status: 404, message: "Question doesn't exist."};
  if (question?.status != 3 && authorization.owner != question?.author) throw {status: 403, message: "Forbidden. Question not sent yet and you aren't the owner."};

  // Obter usuário
  const discordUser = await bot.users.fetch(question.author);
  const user = structuredClone(discordUser.toJSON())

  delete user.bot;
  delete user.system;
  delete user.flags;
  delete user.discriminator;
  delete user.avatar;
  delete user.banner;
  delete user.avatarDecoration;
  delete user.avatarDecorationData;
  delete user.defaultAvatarURL;
  delete user.accentColor;
  delete user.tag;
  delete user.createdTimestamp;

  question.author = user;

  // Obter reações e link
  if (question.messageID) {
    const channel = await bot.channels.fetch(process.env.QUESTIONS_CHANNEL_ID) || await bot.channels.cache.get(process.env.QUESTIONS_CHANNEL_ID);
    const message = await channel.messages.fetch(question.messageID) || await channel.messages.cache.get(question.messageID);
    
    const reactions = await message.reactions.cache.toJSON();
    for (let index = 0; index < reactions.length; index++) {
      const currentReaction = reactions[index];
      question.options[index].votes = currentReaction.count - 1;
      // console.log(currentReaction._emoji.name)
    }
    question.messageLink = message.url;
  }

  return question;
}

// POST: Adicionar uma nova pergunta (raw, json)
/*
  title (5 a 150)
  options (formatado como explicado em /emojis)
  description (0 a 350)
  footer (0 a 200)
  image
*/
async function post(req, res, authorization) {
  const newQuestion = req.body;
  newQuestion.options = newQuestion.options.replace(/\\n/g, '\n');
  
  if (!newQuestion.title) throw {status: 400, message: "Missing question's question."};
  if (!newQuestion.options) throw {status: 400, message: "Missing question's options."};
  if (newQuestion.title.length < 5 || newQuestion.title.length > 150) throw {status: 400, message: 'Invalid title length. 5 to 150.'};
  if (newQuestion.description?.length > 350) throw {status: 400, message: 'Invalid description length. 0 to 350.'};
  if (newQuestion.footer?.length > 200) throw {status: 400, message: 'Invalid footer length. 0 to 200.'};

  const userID = authorization.owner;
  const userIsAdmin = admins.includes(userID);
  try {
    const question = await checkAndParseQuestion(newQuestion.title, newQuestion.options, newQuestion.description || null, newQuestion.footer || null, newQuestion.image || null, userID, userIsAdmin ? 2 : 0);
  
    const { error, data } = await database.from('questions').insert(question).select().single();
    if (error) throw {message: error, status: 500};
    await reviewQuestion(data, null, userIsAdmin, 'newQuestion');
    if (userIsAdmin) {
      const similarQuestions = await searchForSimilarQuestions(data.question, data.id, false);
      data.similarQuestions = similarQuestions;
      return data;
    } else {
      return data;
    }
  } catch (error) {
    throw error?.content && error?.from == 'user' ? {message: error.content, status: 400} : error;
  }
}

// PATCH: Editar uma pergunta específica pelo ID
// inicie com _ para usar a messageID
async function patch(req, res, authorization) {
  const editedQuestionData = req.body;
  editedQuestionData.options = editedQuestionData.options.replace(/\\n/g, '\n');

  const userID = authorization.owner;
  const userIsAdmin = admins.includes(userID);
  const id = req.params.id.toString();
  const {data: currentQuestion} = await database.from('questions').select().eq((id.startsWith('_') ? 'messageID' : 'id'), id.replace('_', '')).single();
  if (!currentQuestion) throw {status: 404, message: "Question doesn't exist."};

  if (currentQuestion.author != userID) throw {status: 403, message: "Forbidden. You aren't the owner."};

  if (!editedQuestionData.title) throw {status: 400, message: "Missing question's question."};
  if (!editedQuestionData.options) throw {status: 400, message: "Missing question's options."};
  if (editedQuestionData.title.length < 5 || editedQuestionData.title.length > 150) throw {status: 400, message: 'Invalid title length. 5 to 150.'};
  if (editedQuestionData.description?.length > 350) throw {status: 400, message: 'Invalid description length. 0 to 350.'};
  if (editedQuestionData.footer?.length > 200) throw {status: 400, message: 'Invalid footer length. 0 to 200.'};

  try {
    const editedQuestion = await checkAndParseQuestion(editedQuestionData.title, editedQuestionData.options, editedQuestionData.description || null, editedQuestionData.footer || null, editedQuestionData.image || null, userID, userIsAdmin ? 2 : 0);

    const momentSentAt = moment(currentQuestion.sentAt, moment.ISO_8601);
    const twentyFourHoursAgo = moment.tz(moment().subtract(24, 'hours'), 'America/Sao_Paulo');
    const wasSentInTheLast24Hours = momentSentAt.isSameOrAfter(twentyFourHoursAgo);

    if (wasSentInTheLast24Hours) {
      const data = await editQuestionAlreadySent(null, editedQuestion, [currentQuestion], userIsAdmin, currentQuestion.id);
      return data;
    } else {
      const { error, data } = await database.from('questions').update(editedQuestion).eq('id', currentQuestion.id).select().single();
      if (error) throw {message: error, status: 500};
      await reviewQuestion(data, null, userIsAdmin, 'editQuestion');
      return data;
    }
  } catch (error) {
    throw error?.content && error?.from == 'user' ? {message: error.content, status: 400} : error;
  }
}

// DELETE: Apagar uma pergunta específica pelo ID
// inicie com _ para usar a messageID
async function del(req, res, authorization) {
  const id = req.params.id.toString();

  const { data: question } = await database.from('questions').select().eq((id.startsWith('_') ? 'messageID' : 'id'), id.replace('_', '')).single();
  if (!question) throw {status: 404, message: "Question doesn't exist."};
  if (question?.status == 3 || authorization.owner != question?.author) throw {status: 403, message: "Forbidden. Question already sent and you aren't the owner."};
  
  const {data} = await database.from('questions').delete().eq('id', question.id).select().single();
  return data;
}

module.exports = { get, post, patch, del };