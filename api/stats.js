const moment = require('moment-timezone');

// GET: Obter estatísticas
// status: filtrar o ranking de autores por status
async function get(req) {
  const queries = req.query;
  const { data: questionsData } = await database.from('questions').select('status,author');

  const approvedQuestionsLength = questionsData.filter(question => question.status == 2).length;
  const sentQuestionsLength = questionsData.filter(question => question.status == 3).length;
  const declinedQuestionsLength = questionsData.filter(question => question.status == 1).length;
  const inReviewQuestionsLength = questionsData.filter(question => question.status == 0).length;
  const daysPrediction = moment.tz(moment(), 'America/Sao_Paulo').add(approvedQuestionsLength, 'days').set({'hour': 12, 'minute': 0, 'second': 0}).toISOString();
  
  const count = questionsData.filter(e => {
    if (queries.status) {
      return e.status == queries.status
    } else {
      return true
    }
  }).reduce((acc, item) => {
    const author = item.author;
    acc[author] = (acc[author] || 0) + 1;
    return acc;
  }, {});
  const authorRanking = Object.entries(count).map(([author, questionsCount]) => ({ author, questionsCount })).sort((a, b) => b.questionsCount - a.questionsCount);

  return {approvedQuestions: approvedQuestionsLength, sentQuestions: sentQuestionsLength, declinedQuestions: declinedQuestionsLength, inReviewQuestions: inReviewQuestionsLength, daysPrediction, authorRanking}
}

module.exports = { get };