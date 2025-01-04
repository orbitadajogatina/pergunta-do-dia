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
    throw { status: 403, message: "Proíbido. A pergunta não foi enviada ainda, mas você não é o dono dela." };
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
    { condition: !newQuestion.title, message: "Falta a pergunta né meu filho." },
    { condition: !newQuestion.options, message: "Falta algumas opções na pergunta." },
    { condition: newQuestion.title.length < 5 || newQuestion.title.length > 150, message: 'Título inválido. esperado tamanho de 0 até 150 em caracteres.' },
    { condition: newQuestion.description?.length > 350, message: 'Descrição inválida. esperado tamanho de 0 até 350 em caracteres.' },
    { condition: newQuestion.footer?.length > 200, message: 'Footer inválido. esperado tamanho de 0 até 200 em caracteres.' }
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

// PATCH: Editar uma pergunta específica
async function patch(req, res, authorization) {
  const editedQuestionData = req.body;
  editedQuestionData.options = editedQuestionData.options.replace(/\\n/g, '\n');

  const userID = authorization.owner;
  const userIsAdmin = admins.includes(userID);
  const id = req.params.id.toString();
  const { data: currentQuestion } = await database.from('questions').select().eq(id.startsWith('_') ? 'messageID' : 'id', id.replace('_', '')).single();
  
  if (!currentQuestion) throw { status: 404, message: "Question doesn't exist." };
  if (currentQuestion.author !== userID) throw { status: 403, message: "Proíbido. Você felizmente não é o dono." };

  // Validação de dados
  validateFields([
    { condition: !editedQuestionData.title, message: "Falta a pergunta né meu filho." },
    { condition: !editedQuestionData.options, message: "Falta alguams opções na pergunta." },
    { condition: editedQuestionData.title.length < 5 || editedQuestionData.title.length > 150, message: 'Título inválido. esperado tamanho de 0 até 150 em caracteres.' },
    { condition: editedQuestionData.description?.length > 350, message: 'Descrição inválida. esperado tamanho de 0 até 350 em caracteres.' },
    { condition: editedQuestionData.footer?.length > 200, message: 'Footer inválido. esperado tamanho de 0 até 200 em caracteres.' }
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

  if (!question) throw { status: 404, message: "Essa pergunta não existe." };
  if (question.status === 3 || authorization.owner !== question.author) {
    throw { status: 403, message: "Proíbido. Essa pergunta já foi enviada e você não é o dono dela 😊." };
  }

  const { data } = await database.from('questions').delete().eq('id', question.id).select().single();
  return data;
}

module.exports = { get, post, patch, del };
