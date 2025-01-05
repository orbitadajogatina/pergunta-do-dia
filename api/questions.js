const { checkAndParseQuestion, reviewQuestion, searchForSimilarQuestions } = require('../core/questionManager');
const moment = require('moment-timezone');
const { editQuestionAlreadySent } = require('../interactions/editQuestion');
const { cleanUserData } = require('../utils/cleanUserData');

// Função para validações
function validateFields(fields) {
  const validationError = fields.find(field => field.condition);
  if (validationError) throw { status: 400, message: validationError.message };
}

// GET /questions (todas, por ID ou a última)
async function getAllQuestions(req, owner) {
  const { query } = req;
  const { page = 0, author, search } = query;

  let dbQuery = database
    .from("questions")
    .select()
    .or(`status.eq.3, and(status.eq.0, author.eq.${owner}), and(status.eq.1, author.eq.${owner}), and(status.eq.2, author.eq.${owner})`);

  if (search) dbQuery = dbQuery.textSearch("search_columns", search, { config: "english", type: "websearch" });
  if (author) dbQuery = dbQuery.eq("author", author);

  const { data: questions, error } = await dbQuery
    .order("sentAt")
    .range(500 * page, 499 + 500 * page);

  return { questions, count: questions?.length, error };
}

async function getQuestionByID(id, owner) {
  const column = id.startsWith('_') ? 'messageID' : 'id';
  const { data: question } = await database.from('questions').select().eq(column, id.replace('_', '')).single();
  
  if (!question) throw { status: 404, message: "Question doesn't exist." };
  if (question.status !== 3 && owner !== question.author) throw { status: 403, message: "Forbidden. Question not sent yet and you aren't the owner." };

  // Obter e limpar dados do usuário
  const discordUser = await bot.users.fetch(question.author);
  const user = structuredClone(discordUser.toJSON());
  cleanUserData(user);
  question.author = user;

  // Obter reações e link
  if (question.messageID) {
    const channel = await bot.channels.fetch(process.env.QUESTIONS_CHANNEL_ID) || await bot.channels.cache.get(process.env.QUESTIONS_CHANNEL_ID);
    const message = await channel.messages.fetch(question.messageID) || await channel.messages.cache.get(question.messageID);
    
    const reactions = await message.reactions.cache.toJSON();
    for (let index = 0; index < reactions.length; index++) {
      const currentReaction = reactions[index];
      question.options[index].votes = currentReaction.count - 1;
    }
    question.messageLink = message.url;
  }

  return question;
}

async function getLatestQuestionID() {
  const {data: {id}} = await database.from('questions').select('id').order('sentAt', { ascending: false, nullsFirst: false }).limit(1).single();
  return id;
}

async function get(req, res, authorization) {
  let id = req.params.id?.toString();

  if (!id) return await getAllQuestions(req, authorization.owner);
  if (id === 'latest') id = (await getLatestQuestionID())?.toString();
  return await getQuestionByID(id, authorization.owner);
}

// POST /questions
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

// PUT /questions/id
async function put(req, res, authorization) {
  const editedQuestionData = req.body;
  editedQuestionData.options = editedQuestionData.options.replace(/\\n/g, '\n');

  const userID = authorization.owner;
  const userIsAdmin = admins.includes(userID);
  const id = req.params.id.toString();
  const column = id.startsWith('_') ? 'messageID' : 'id';
  const { data: currentQuestion } = await database.from('questions').select().eq(column, id.replace('_', '')).single();
  
  if (!currentQuestion) throw { status: 404, message: "Question doesn't exist." };
  if (currentQuestion.author !== userID) throw { status: 403, message: "Forbidden. You aren't the owner." };

  // Validação de dados
  validateFields([
    { condition: !editedQuestionData.title, message: "Missing question's question." },
    { condition: !editedQuestionData.options, message: "Missing question's options." },
    { condition: editedQuestionData.title.length < 5 || editedQuestionData.title.length > 150, message: 'Invalid title length. 5 to 150 characters.' },
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

// DELETE /questions/id
async function del(req, res, authorization) {
  const id = req.params.id.toString();
  const column = id.startsWith('_') ? 'messageID' : 'id';
  const { data: question } = await database.from('questions').select().eq(column, id.replace('_', '')).single();

  if (!question) throw { status: 404, message: "Question doesn't exist." };
  if (question.status === 3 || authorization.owner !== question.author) throw { status: 403, message: "Forbidden. Question already sent and/or you aren't the owner." };

  const { data } = await database.from('questions').delete().eq('id', question.id).select().single();
  return data;
}

module.exports = { get, post, put, del };