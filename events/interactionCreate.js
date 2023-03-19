const logError = require('../core/logError');

// Isso aqui poderia ser feito de uma forma melhor. Quem sabe depois.

module.exports = {
	name: 'interactionCreate',
  once: false,
  async execute (interaction) {
    if (interaction.isModalSubmit()) {
      try {
        await require(`../interactions/${interaction.customId.split('_')[0]}`).execute(interaction);
      } catch (error) {
        logError(error, interaction.customId);
        await interaction.editReply(`**Eita.** Há um errinho neste comando. Chama o Enzo pra resolver essa parada!\n\nSeu rascunho:\n${interaction.fields.fields.map(field => `${field.customId}: \`${field.value ? field.value : '-'}\``).join('\n')}\n\n\`\`\`\n${error}\`\`\``);
      }
    } else if (interaction.isStringSelectMenu()) {
      try {
        await require(`../interactions/${interaction.customId}`).execute(interaction);
      } catch (error) {
        logError(error, interaction.customId);
        await interaction.editReply({content: `**Eita.** Há um errinho neste comando. Chama o Enzo pra resolver essa parada!\n\n\`\`\`\n${error}\`\`\``, components: []});
      }
    } else if (interaction.isChatInputCommand()) {
      const command = bot.commands.get(interaction.commandName);
      try {
        await command.execute(interaction);
      } catch (error) {
        logError(error, command.properties.name);
        await interaction.reply(`**Eita.** Há um errinho neste comando. Chama o Enzo pra resolver essa parada!\n\n\`\`\`\n${error}\`\`\``);
      }
    } else if (interaction.isButton()) {
      try {
        const buttonsIDs = interaction.customId.split('_');
        await require(`../buttons/${buttonsIDs[0]}`)[buttonsIDs[1]](interaction);
      } catch (error) {
        logError(error, interaction.customId);
        await interaction.editReply(`**Eita.** Há um errinho neste comando. Chama o Enzo pra resolver essa parada!\n\n\`\`\`\n${error}\`\`\``);
      }
    } else {
      return;
    }
  }
}