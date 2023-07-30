const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

const properties = new SlashCommandBuilder()
  .setName('nova-pergunta')
  .setDescription('Adicionar uma nova pergunta no banco de dados do bot. Será enviada sabe-se lá quando.')
  .addStringOption(option =>
    option.setName('modelo')
      .setDescription('Se quiser, pode começar com opções pré-definidas.')
      .setRequired(false)
      .addChoices(
        { name: '👍 Sim e 👎 Não', value: 'yesAndNo' },
        { name: 'Análise/Qualidade (Péssimo, Ruim, Razoável, Bom, Ótimo)', value: 'review' },
        { name: 'De 1 a 5', value: 'count-5' },
        { name: 'De 1 a 10', value: 'count-10' },
        { name: 'De 1 a 15', value: 'count-15' },
        { name: 'De 1 a 20', value: 'count-20' },
        { name: '❔ Outro e ⛔ Nunca', value: 'otherAndNever' },
      ));

async function execute(interaction) {
  let questionBuilder = buildNewQuestionModal();
  const templateData = interaction.options.getString('modelo')?.split('-');
  
  if (templateData) {
    const templates = {
      yesAndNo: () => '👍 - Sim\n👎 - Não',
      review: () => '## - Péssimo\n## - Ruim\n## - Razoável\n## - Bom\n## - Ótimo',
      otherAndNever: () => '❔ - Outro\n⛔ - Nunca',
      count: (params) => Array.from({ length: Number(params[1]) }, (_, index) => `## - ${index + 1}`).join('\n')
    }

    const selectedTemplate = templateData[0];
    questionBuilder.components[1].components[0].data.value = templates[selectedTemplate](templateData)
  }

  await interaction.showModal(questionBuilder);
}

const buildNewQuestionModal = () => new ModalBuilder()
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

module.exports = { properties, execute, buildNewQuestionModal, id: 'newQuestion' };