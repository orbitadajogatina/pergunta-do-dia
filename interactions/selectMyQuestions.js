const database = global.database;
const transformQuestionsDataToEmbed = require('../core/transformQuestionsDataToEmbed');

async function execute (interaction) {
	const userID = interaction.user.id;
  if (userID == interaction.message.interaction.user.id) {
		await interaction.deferUpdate();
		
		const optionID = interaction.values[0].slice(11);
		const questions = database.from('questions');
		const embed = transformQuestionsDataToEmbed((await questions.select().eq('id', optionID)).data[0], true);

		await interaction.editReply({ embeds: [(embed)] });
	}
}

module.exports = {execute}