const { parseOptions } = require('./parseFields');

module.exports = async function transformEmbedToQuestionsData (embed, parse = true) {
  const sections = embed.description.split('\n\n');
  let description, options, footer;
  if (sections.length === 3) {
    description = sections[0];
    options = sections[1];
    footer = sections[2].replace(/\_(.*?)\_/, '$1');
  } else if (sections.length === 2 && sections[1].startsWith('_')) {
    description = '';
    options = sections[0];
    footer = sections[1].replace(/\_(.*?)\_/, '$1');
  } else if (sections.length === 2) {
    description = sections[0];
    options = sections[1];
    footer = '';
  } else {
    description = '';
    options = sections[0];
    footer = '';
  }

  options = options.replace(/\[Imagem\]\((.*?)\)/g, '$1');
  if (parse) options = await parseOptions(options);
  
  return {
    question: embed.title,
    description,
    options,
    footer,
    image: embed.image?.url || null
  };
}