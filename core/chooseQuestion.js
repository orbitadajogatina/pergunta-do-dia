const transformQuestionsDataToDropdown = require('../core/transformQuestionsDataToDropdown');
const transformQuestionsDataToEmbed = require('../core/transformQuestionsDataToEmbed');
const moment = require('moment-timezone');

function makeMessageWithDropdownsAndButtons (questionsData = [], dropdownID, messageOnNoQuestions) {
  if (questionsData.length > 0) {
    const dropdownWithButtons = transformQuestionsDataToDropdown(questionsData, 0, dropdownID);
    return { components: dropdownWithButtons, embeds: [], content: '' };
  } else {
    return { content: messageOnNoQuestions, components: [], embeds: [] };
  }
}

function changePageOfDropdown (page, oldComponents, questionsData, dropdownID, messageOnNoQuestions) {
  if (questionsData.length > 0) {
    // imagine que você já selecionou uma pergunta, você tem que manter os botões dela lá
    let oldButtons = [];
    if (!oldComponents[0].components[0].data.custom_id.includes(dropdownID)) oldButtons = [oldComponents[0]];

    const dropdown = transformQuestionsDataToDropdown(questionsData, page, dropdownID);

    return { components: [...oldButtons, ...dropdown] };
  } else {
    return messageOnNoQuestions;
  }
}

async function selectQuestion (questionID, questionsData, dropdownID, otherComponents = [], page = 0) {
  const { data: selectedQuestionData } = await database.from('questions').select().eq('id', questionID);
  const embed = transformQuestionsDataToEmbed(selectedQuestionData[0], true);
  const dropdown = transformQuestionsDataToDropdown(questionsData, page, dropdownID);

  return { content: '', embeds: [embed], components: [...otherComponents, ...dropdown] };
}

const questionsDataByCommand = {
  manageQuestion: async (interaction) => {
    const userID = interaction.user.id;
    const twentyFourHoursAgo = moment.tz(moment().subtract(24, 'hours'), 'America/Sao_Paulo');
    const { data, error } = await database.from('questions').select('question, id, status, options, createdAt').eq('author', userID).or(`sentAt.is.null,sentAt.gte.${twentyFourHoursAgo.format()}}`).order('createdAt', { ascending: false });
    
    return data?.sort((a, b) => a.status - b.status);
  },
  viewQuestion: async (interaction) => {
    const userID = interaction.user.id;
    const { data } = await database.from('questions').select('question, id, status, options, createdAt').eq('author', userID).order('createdAt', { ascending: false });
    return data?.sort((a, b) => a.status - b.status);
  },
  sendQuestion: async (interaction) => {
    const { data } = await database.from('questions').select('question, id, status, options, createdAt').eq('status', 2).is('sentAt', null).order('createdAt', { ascending: false });

    return data;
  },
  changeStatusOfQuestion: async (interaction) => {
    const { data } = await database.from('questions').select('question, id, status, options, createdAt').is('sentAt', null).order('createdAt', { ascending: false });

    return data;
  }
}

module.exports = {makeMessageWithDropdownsAndButtons, changePageOfDropdown, selectQuestion, questionsDataByCommand};