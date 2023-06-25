const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

const properties = new SlashCommandBuilder()
  .setName('nova-pergunta')
  .setDescription('Adicionar uma nova pergunta no banco de dados do bot. Será enviada sabe-se lá quando.');

async function execute(interaction) {
  await interaction.showModal(questionBuilder());
}

function questionBuilder() {
  return new ModalBuilder()
    .setCustomId('newQuestion')
    .setTitle('Nova pergunta')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('question')
          .setLabel('Pergunta')
          .setPlaceholder('Fica em negrito.')
          .setMinLength(5)
          .setMaxLength(150)
          .setRequired(true)
          .setStyle(TextInputStyle.Short)    
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('options')
          .setLabel('Opções')
          .setPlaceholder('Formatação: "👍 - Sim" por linha. Conheça recursos avançados usando o comando /emojis')
          .setMinLength(6)
          .setRequired(true)
          .setStyle(TextInputStyle.Paragraph)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('description')
          .setLabel('Descrição')
          .setPlaceholder('Contextualização. Fica em baixo da pergunta.')
          .setMaxLength(350)
          .setRequired(false)
          .setStyle(TextInputStyle.Paragraph)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('footer')
          .setLabel('Notas de Rodapé')
          .setPlaceholder('Fica em itálico e vem depois das opções.')
          .setMaxLength(200)
          .setRequired(false)
          .setStyle(TextInputStyle.Short)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('image')
          .setLabel('Imagem (URL)')
          .setPlaceholder('Vem por último, após as opções e o rodapé.')
          .setRequired(false)
          .setStyle(TextInputStyle.Short)
      )
    );
}

module.exports = { properties, execute, questionBuilder };
