const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

async function question (interaction) {
  const questionBuilder = new ModalBuilder()
    .setCustomId(interaction.customId)
    .setTitle('Editar pergunta')
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
      )
    );
  
  await interaction.showModal(questionBuilder);
}

async function options (interaction) {
  const questionBuilder = new ModalBuilder()
    .setCustomId(interaction.customId)
    .setTitle('Editar pergunta')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('options')
          .setLabel('Opções')
          .setPlaceholder('Formatação: "👍 - Sim" por linha. Conheça recursos avançados usando o comando /emojis')
          .setMinLength(6)
          .setMaxLength(500)
          .setRequired(true)
          .setStyle(TextInputStyle.Paragraph)
      )
    );
  
  await interaction.showModal(questionBuilder);
}

async function description (interaction) {
  const questionBuilder = new ModalBuilder()
    .setCustomId(interaction.customId)
    .setTitle('Editar pergunta')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('description')
          .setLabel('Descrição')
          .setPlaceholder('Contextualização. Fica em baixo da pergunta.')
          .setMaxLength(350)
          .setRequired(false)
          .setStyle(TextInputStyle.Paragraph)
      )
    );
  
  await interaction.showModal(questionBuilder);
}

async function footer (interaction) {
  const questionBuilder = new ModalBuilder()
    .setCustomId(interaction.customId)
    .setTitle('Editar pergunta')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('footer')
          .setLabel('Notas de Rodapé')
          .setPlaceholder('Fica em itálico e vem depois das opções.')
          .setMaxLength(200)
          .setRequired(false)
          .setStyle(TextInputStyle.Short)
      )
    );
  
  await interaction.showModal(questionBuilder);
}

async function image (interaction) {
  const questionBuilder = new ModalBuilder()
    .setCustomId(interaction.customId)
    .setTitle('Editar pergunta')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('image')
          .setLabel('Imagem (URL)')
          .setPlaceholder('Vem por último, após as opções e o rodapé.')
          .setRequired(false)
          .setStyle(TextInputStyle.Short)
      )
    );
  
  await interaction.showModal(questionBuilder);
}

module.exports = {question, options, description, footer, image}