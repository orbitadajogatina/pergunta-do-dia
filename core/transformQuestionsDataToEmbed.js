const { EmbedBuilder } = require('discord.js');
const moment = require('moment-timezone');

function parseOptionsReverse (arrayOptions) {
	return arrayOptions.map(option => `${option.emoji} - ${option.text}`).join('\n');
}

module.exports = function transformQuestionsDataToEmbed (data, includeStatusAndDates) {
  let questionEmbed = new EmbedBuilder()
    .setColor('Random')
    .setTitle(data.question)
    .setDescription(`${data.description ? data.description : ''}\n\n${parseOptionsReverse(data.options)}\n\n${data.footer ? `_${data.footer}_` : ''}`)
    .setImage(data.image || null);
    
  // if (data.image) questionEmbed.setImage(data.image);
  if (includeStatusAndDates) questionEmbed.addFields(
    {
      name: 'Situação', 
      value: ['Em análise', 'Recusada', 'Aprovada', 'Enviada'][data.status], 
      inline: true
    },
    {
      name: 'Data de Criação', 
      value: data.createdAt ? `<t:${moment(data.createdAt).unix()}:R>` : `<t:${moment().unix()}:R>`, 
      inline: true
    },
    {
      name: 'Data de Envio', 
      value: data.sentAt ? `<t:${moment(data.sentAt + '-03:00').unix()}:R>` : '-', 
      inline: true
    }
  );

  return questionEmbed;
}