const { SlashCommandBuilder } = require('discord.js');

const properties = new SlashCommandBuilder()
  .setName('emojis')
  .setDescription('Um guia de uso para emojis');

async function execute(interaction) {
  await interaction.reply(`• Criar emojis usando imagens aleatórias do Google
Use \`$$\` ao invés do emoji, assim: \`$$ - Feijão carioca\`.

• Criar emojis usando link de uma imagem
Use \`$link$\` ao invés do emoji, assim: \`$http://pudim.com.br/pudim.jpg$ - Pudim\`.

• Enumerar automaticamente opções usando emojis (1 a 10)
Use \`##\` ao invés do emoji, assim: \`## - Lápis\`.

• Usar emojis normais
Emojis escritos como \`:nomedoemoji:\` não funcionam, adicione usando seu teclado ou \`Windows + .\`. Para emojis do servidor, é necessário informar o ID, [saiba mais](https://support.discord.com/hc/en-us/community/posts/360069335891/comments/1500000646661).`);
}

module.exports = { properties, execute };