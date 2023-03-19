const database = global.database;
const transformQuestionsDataToEmbed = require('../core/transformQuestionsDataToEmbed');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

async function execute (interaction) {
	const userID = interaction.user.id;
  if (userID == interaction.message.interaction.user.id) {
		await interaction.deferUpdate();
		
		const questionID = interaction.values[0].slice(11);
		const questions = database.from('questions');
		const embed = transformQuestionsDataToEmbed((await questions.select().eq('id', questionID)).data[0], true);

		const buttons = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId(`setQuestionStatus_approve_${questionID}`)
					.setLabel('Aprovar')
					.setStyle(ButtonStyle.Success),
				new ButtonBuilder()
					.setCustomId(`setQuestionStatus_decline_${questionID}`)
					.setLabel('Recusar')
					.setStyle(ButtonStyle.Danger)
			);

		const oldComponents = interaction.message.components;
		await interaction.editReply({ embeds: [(embed)], components: [buttons, ...oldComponents.slice(-2)] });
	}
}

module.exports = {execute}