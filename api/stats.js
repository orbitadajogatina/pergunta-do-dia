const moment = require("moment-timezone");

async function get(req) {
  const { query } = req;

  const questionsData = [];
  let from = 0;
  const pageSize = 1000;
  let done = false;

  while (!done) {
    const { data, error } = await database
      .from("questions")
      .select("status,author")
      .range(from, from + pageSize - 1);

    if (error) throw error;

    questionsData.push(...data);
    if (data.length < pageSize) done = true;
    from += pageSize;
  }

  const questionStatusCounts = questionsData.reduce((acc, { status }) => {
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const approvedQuestionsLength = questionStatusCounts[2] || 0;
  const sentQuestionsLength = questionStatusCounts[3] || 0;
  const declinedQuestionsLength = questionStatusCounts[1] || 0;
  const inReviewQuestionsLength = questionStatusCounts[0] || 0;

  const daysPrediction = moment
    .tz(moment(), "America/Sao_Paulo")
    .add(approvedQuestionsLength, "days")
    .set({ hour: 12, minute: 0, second: 0 })
    .toISOString();

  const filteredQuestions = questionsData.filter(({ status }) => {
    return query.status ? status === Number(query.status) : true;
  });

  const authorCount = filteredQuestions.reduce((acc, { author }) => {
    acc[author] = (acc[author] || 0) + 1;
    return acc;
  }, {});

  const authorRanking = Object.entries(authorCount)
    .map(([author, questionsCount]) => ({ author, questionsCount }))
    .sort((a, b) => b.questionsCount - a.questionsCount);

  return {
    approvedQuestions: approvedQuestionsLength,
    sentQuestions: sentQuestionsLength,
    declinedQuestions: declinedQuestionsLength,
    inReviewQuestions: inReviewQuestionsLength,
    daysPrediction,
    authorRanking,
  };
}

module.exports = { get };
