const database = global.database;
const transformQuestionsDataToEmbed = require('../core/transformQuestionsDataToEmbed');
const transformQuestionsDataToDropdown = require('../core/transformQuestionsDataToDropdown');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

async function selectQuestionToEdit (questionID, userID) {
	const embed = transformQuestionsDataToEmbed((await database.from('questions').select().eq('id', questionID)).data[0], false);

	const fieldsButton = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId(`editQuestion_question_${questionID}`)
				.setLabel('Alterar Pergunta')
				.setStyle(ButtonStyle.Secondary),
			new ButtonBuilder()
				.setCustomId(`editQuestion_description_${questionID}`)
				.setLabel('Alterar Descrição')
				.setStyle(ButtonStyle.Secondary),
			new ButtonBuilder()
				.setCustomId(`editQuestion_options_${questionID}`)
				.setLabel('Alterar Opções')
				.setStyle(ButtonStyle.Secondary),
			new ButtonBuilder()
				.setCustomId(`editQuestion_footer_${questionID}`)
				.setLabel('Alterar Notas de Rodapé')
				.setStyle(ButtonStyle.Secondary),
			new ButtonBuilder()
				.setCustomId(`editQuestion_image_${questionID}`)
				.setLabel('Alterar Imagem')
				.setStyle(ButtonStyle.Secondary)
		);

	const questionsData = (await database.from('questions').select('question, id, status, createdAt').eq('author', userID).is('sentAt', null).order('createdAt', { ascending: false })).data.sort((a, b) => a.status - b.status);
	const dropdown = transformQuestionsDataToDropdown(questionsData, 0, 'chooseQuestionToEdit');
	return { embeds: [(embed)], components: [fieldsButton, ...dropdown] };
}

async function execute (interaction) {
	const userID = interaction.user.id;
  if (userID == interaction.message.interaction.user.id) {
		await interaction.deferUpdate();
		const questionID = interaction.values[0].slice(11);
		const replyWithSelectedQuestion = await selectQuestionToEdit(questionID, userID);
		await interaction.editReply(replyWithSelectedQuestion);
	}
}

module.exports = {execute, selectQuestionToEdit}