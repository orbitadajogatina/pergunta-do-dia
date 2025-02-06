const transformQuestionsDataToDropdown = require('../core/transformQuestionsDataToDropdown');
const transformQuestionsDataToEmbed = require('../core/transformQuestionsDataToEmbed');
const moment = require('moment-timezone');

function makeMessageWithDropdownsAndButtons (questionsData = [], dropdownID, messageOnNoQuestions, options) {
  if (questionsData.length > 0) {
    const dropdownWithButtons = transformQuestionsDataToDropdown(questionsData, 0, dropdownID);
    return { components: dropdownWithButtons, embeds: [], content: options?.length > 0 ? '**Filtros**\n' + options.map(option => `${option.name}: ${option.value.toString().replace(/\@/g, '')}`).join('\n') : '' };
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

  return { embeds: [embed], components: [...otherComponents, ...dropdown] };
}

function getFilters(interaction, options) {
  const filtersAsString = interaction.message?.content.split("\n").filter(line => !line.startsWith("*"));
  const filtersStringAsObject = filtersAsString?.map(filter => {
    const [key, value] = filter.split(":").map(part => part.trim());
    return { name: key, value: value };
  });
  
  return  options || filtersStringAsObject || [];
}

const questionsDataByCommand = {
  manageQuestion: async (interaction, options = interaction.options?.data) => {
    const userID = interaction.user.id;
    const twentyFourHoursAgo = moment.tz(moment().subtract(24, 'hours'), 'America/Sao_Paulo');

    const filters = getFilters(interaction, options);
    const questionFilterQuery = filters.find(filter => filter.name === 'pergunta');
    const statusFilter = filters.find(filter => filter.name === 'situação');
    
    let { data } = await database
      .from('questions')
      .select('question, id, status, options, createdAt')
      .eq('author', userID)
      .or(`sentAt.is.null,sentAt.gte.${twentyFourHoursAgo.format()}}`)
      .order('createdAt', { ascending: false })
      .filter('status', statusFilter?.value.toString() ? 'eq' : 'neq', statusFilter?.value.toString() || -1)
      .ilike('question', '%' + questionFilterQuery?.value + '%');
    
    return data?.sort((a, b) => a.status - b.status);
  },
  viewQuestion: async (interaction, options = interaction.options?.data) => {
    const userID = interaction.user.id;

    const filters = getFilters(interaction, options);
    const questionFilterQuery = filters.find(filter => filter.name === 'pergunta');
    const statusFilter = filters.find(filter => filter.name === 'situação');
    
    let { data } = await database
      .from('questions')
      .select()
      .eq('author', userID).order('createdAt', { ascending: false })
      .filter('status', statusFilter?.value.toString() ? 'eq' : 'neq', statusFilter?.value.toString() || -1)
      .ilike('question', '%' + questionFilterQuery?.value + '%');
        
    return data?.sort((a, b) => a.status - b.status);
  },
  sendQuestion: async (interaction, options = interaction.options?.data) => {
    const filters = getFilters(interaction, options);
    const questionFilterQuery = filters.find(filter => filter.name === 'pergunta');
    
    let { data } = await database
      .from('questions')
      .select('question, id, status, options, createdAt')
      .eq('status', 2)
      .is('sentAt', null)
      .order('createdAt', { ascending: false })
      .ilike('question', '%' + questionFilterQuery?.value + '%');

    return data;
  },
  changeStatusOfQuestion: async (interaction, options = interaction.options?.data) => {
    const filters = getFilters(interaction, options);
    const questionFilterQuery = filters.find(filter => filter.name === 'pergunta');
    const statusFilter = filters.find(filter => filter.name === 'situação');
    
    let { data } = await database
      .from('questions')
      .select('question, id, status, options, createdAt')
      .is('sentAt', null)
      .order('createdAt', { ascending: false })
      .filter('status', statusFilter?.value.toString() ? 'eq' : 'neq', statusFilter?.value.toString() || -1)
      .ilike('question', '%' + questionFilterQuery?.value + '%');

    return data;
  }
}

module.exports = {makeMessageWithDropdownsAndButtons, changePageOfDropdown, selectQuestion, questionsDataByCommand};