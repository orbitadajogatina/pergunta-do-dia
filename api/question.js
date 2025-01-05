const { checkAndParseQuestion, reviewQuestion, searchForSimilarQuestions } = require('../core/questionManager');
const moment = require('moment-timezone');
const { editQuestionAlreadySent } = require('../interactions/editQuestion');

// Função para validações
function validateFields(fields) {
  const validationError = fields.find(field => field.condition);
  if (validationError) throw { status: 400, message: validationError.message };
}

// Função para limpar dados do usuário
function cleanUserData(user) {
  const fieldsToRemove = ['bot', 'system', 'flags', 'discriminator', 'avatar', 'banner', 'avatarDecoration', 'avatarDecorationData', 'defaultAvatarURL', 'accentColor', 'tag', 'createdTimestamp'];
  fieldsToRemove.forEach(field => delete user[field]);
}

// GET: Obter uma pergunta específica pelo ID
async function get(req, res, authorization) {
  const id = req.params.id.toString();
  const column = id.startsWith('_') ? 'messageID' : 'id';
  const { data: question } = await database.from('questions').select().eq(column, id.replace('_', '')).single();
  
  if (!question) throw { status: 404, message: "Question doesn't exist." };
  if (question.status !== 3 && authorization.owner !== question.author) {
    throw { status: 403, message: "Forbidden. Question not sent yet and you aren't the owner." };
  }

  // Obter e limpar dados do usuário
  const discordUser = await bot.users.fetch(question.author);
  const user = structuredClone(discordUser.toJSON());
  cleanUserData(user);
  question.author = user;

  // Obter reações e link
  if (question.messageID) {
    const channel = await bot.channels.fetch(process.env.QUESTIONS_CHANNEL_ID);
    const message = await channel.messages.fetch(question.messageID);
    
    const reactions = await message.reactions.cache.toJSON();
    question.options.forEach((option, index) => {
      const currentReaction = reactions[index];
      option.votes = currentReaction ? currentReaction.count - 1 : 0; // Subtrai 1 para não contar o bot
    });
    question.messageLink = message.url;
  }

  return question;
}

// POST: Adicionar uma nova pergunta
async function post(req, res, authorization) {
  const newQuestion = req.body;
  newQuestion.options = newQuestion.options.replace(/\\n/g, '\n');
  
  // Validação de dados
  validateFields([
    { condition: !newQuestion.title, message: "Missing question's question." },
    { condition: !newQuestion.options, message: "Missing question's options." },
    { condition: newQuestion.title.length < 5 || newQuestion.title.length > 150, message: 'Invalid title length. 5 to 150 characters.' },
    { condition: newQuestion.description?.length > 350, message: 'Invalid description length. 0 to 350 characters.' },
    { condition: newQuestion.footer?.length > 200, message: 'Invalid footer length. 0 to 200 characters.' }
  ]);

  const userID = authorization.owner;
  const userIsAdmin = admins.includes(userID);

  try {
    const question = await checkAndParseQuestion(
      newQuestion.title,
      newQuestion.options,
      newQuestion.description || null,
      newQuestion.footer || null,
      newQuestion.image || null,
      userID,
      userIsAdmin ? 2 : 0
    );

    const { error, data } = await database.from('questions').insert(question).select().single();
    if (error) throw { message: error, status: 500 };

    await reviewQuestion(data, null, userIsAdmin, 'newQuestion');

    if (userIsAdmin) {
      const similarQuestions = await searchForSimilarQuestions(data.question, data.id, false);
      data.similarQuestions = similarQuestions;
    }

    return data;
  } catch (error) {
    throw error?.content && error?.from === 'user' ? { message: error.content, status: 400 } : error;
  }
}

// PUT: Editar uma pergunta específica
async function put(req, res, authorization) {
  const editedQuestionData = req.body;
  editedQuestionData.options = editedQuestionData.options.replace(/\\n/g, '\n');

  const userID = authorization.owner;
  const userIsAdmin = admins.includes(userID);
  const id = req.params.id.toString();
  const { data: currentQuestion } = await database.from('questions').select().eq(id.startsWith('_') ? 'messageID' : 'id', id.replace('_', '')).single();
  
  if (!currentQuestion) throw { status: 404, message: "Question doesn't exist." };
  if (currentQuestion.author !== userID) throw { status: 403, message: "Forbidden. You aren't the owner." };

  // Validação de dados
  validateFields([
    { condition: !editedQuestionData.title, message: "Missing question's question." },
    { condition: !editedQuestionData.options, message: "Missing question's options." },
    { condition: editedQuestionData.title.length < 5 || newQuestion.title.length > 150, message: 'Invalid title length. 5 to 150 characters.' },
    { condition: editedQuestionData.description?.length > 350, message: 'Invalid description length. 0 to 350 characters.' },
    { condition: editedQuestionData.footer?.length > 200, message: 'Invalid footer length. 0 to 200 characters.' }
  ]);

  try {
    const editedQuestion = await checkAndParseQuestion(
      editedQuestionData.title,
      editedQuestionData.options,
      editedQuestionData.description || null,
      editedQuestionData.footer || null,
      editedQuestionData.image || null,
      userID,
      userIsAdmin ? 2 : 0
    );

    const momentSentAt = moment(currentQuestion.sentAt, moment.ISO_8601);
    const twentyFourHoursAgo = moment.tz(moment().subtract(24, 'hours'), 'America/Sao_Paulo');
    const wasSentInTheLast24Hours = momentSentAt.isSameOrAfter(twentyFourHoursAgo);

    if (wasSentInTheLast24Hours) {
      const data = await editQuestionAlreadySent(null, editedQuestion, [currentQuestion], userIsAdmin, currentQuestion.id);
      return data;
    } else {
      const { error, data } = await database.from('questions').update(editedQuestion).eq('id', currentQuestion.id).select().single();
      if (error) throw { message: error, status: 500 };

      await reviewQuestion(data, null, userIsAdmin, 'editQuestion');
      return data;
    }
  } catch (error) {
    throw error?.content && error?.from === 'user' ? { message: error.content, status: 400 } : error;
  }
}

// DELETE: Apagar uma pergunta específica
async function del(req, res, authorization) {
  const id = req.params.id.toString();
  const { data: question } = await database.from('questions').select().eq(id.startsWith('_') ? 'messageID' : 'id', id.replace('_', '')).single();

  if (!question) throw { status: 404, message: "Question doesn't exist." };
  if (question.status === 3 || authorization.owner !== question.author) {
    throw { status: 403, message: "Forbidden. Question already sent and/or you aren't the owner." };
  }

  const { data } = await database.from('questions').delete().eq('id', question.id).select().single();
  return data;
}

module.exports = { get, post, put, del };