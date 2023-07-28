const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function getInteractionType(interaction) {
  const interactionTypeMapping = {
    isModalSubmit: "modalSubmit",
    isStringSelectMenu: "stringSelectMenu",
    isButton: "button",
    isChatInputCommand: "chatInputCommand"
  };

  let interactionType;

  for (const methodName in interactionTypeMapping) {
    if (interaction[methodName]?.()) {
      interactionType = interactionTypeMapping[methodName];
      break;
    }
  }

  return interactionType;
}

module.exports = {
	name: 'interactionCreate',
  once: false,
  async execute (interaction) {
    const interactionType = getInteractionType(interaction);
    if (!interactionType) return;
    const interactionID = interaction.customId || (bot.commands.get(interaction.commandName)).id;
    const userID = interaction.user.id;
    const dataOnID = interactionID.split('_');
    const filename = dataOnID[0];
    const functionToExecute = dataOnID[1] || 'execute';
    
    const interactionsPropertiesByType = {
      modalSubmit: {
        path: '../interactions/',
        actionOnError: 'editReply',
        messageOnCodeError: (interaction, error) => {
          const retryButton = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId(`retry_${interaction.customId}`)
                .setLabel('Tentar novamente')
                .setStyle(ButtonStyle.Secondary)
            );
          const userDraft = interaction.fields.fields.map(field => `${field.customId}: \`${field.value ? field.value : '-'}\``).join('\n');

          return {
            content: `**Eita, <@${interaction.user.id}>.** Há um errinho neste comando. Chama o Enzo pra resolver essa parada!\n\nSeu rascunho:\n${userDraft}\n\n\`\`\`\n${error}\`\`\``,
            components: [retryButton],
            embeds: []
          }
        },
        messageOnUserError: (interaction, error) => {
          const retryButton = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId(`retry_${interaction.customId}`)
                .setLabel('Tentar novamente')
                .setStyle(ButtonStyle.Secondary)
            );
          const userDraft = interaction.fields.fields.map(field => `${field.customId}: \`${field.value ? field.value : '-'}\``).join('\n');

          return {
            content: `${error.content}\n\nRascunho de <@${interaction.user.id}>:\n${userDraft}`,
            components: [retryButton],
            embeds: []
          }
        }
      },
      stringSelectMenu: {
        path: '../interactions/',
        actionOnError: 'editReply'
      },
      button: {
        path: '../buttons/',
        actionOnError: 'editReply'
      },
      chatInputCommand: {
        path: '../commands/',
        actionOnError: 'reply'
      }
    };
    const interactionProperties = interactionsPropertiesByType[interactionType] 

    try {
      await require(interactionProperties.path + filename)[functionToExecute](interaction);
    } catch (error) {
      // se não tiver .type no erro, então provavelmente é um erro do código
      if (error.from === 'user') {
        const defaultErrorMessage = {
          content: error.content,
          components: [],
          embeds: []
        }
        const errorMessage = interactionProperties.messageOnUserError ? interactionProperties.messageOnUserError(interaction, error) : defaultErrorMessage;
        await interaction[interactionProperties.actionOnError](errorMessage);
      } else {
        console.error(error, interactionType, interactionID);

        const defaultErrorMessage = {
          content: `**Eita.** Há um errinho neste comando. Chama o Enzo pra resolver essa parada!\n\n\`\`\`\n${error}\`\`\``,
          components: [],
          embeds: []
        }
        const errorMessage = interactionProperties.messageOnCodeError ? interactionProperties.messageOnCodeError(interaction, error) : defaultErrorMessage;
        await interaction[interactionProperties.actionOnError](errorMessage);
      }
    }
  }
}