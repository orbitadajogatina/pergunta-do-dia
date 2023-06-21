const { SlashCommandBuilder } = require('discord.js');

const properties = new SlashCommandBuilder()
  .setName('emojis')
  .setDescription('Um guia de uso para emojis.');

async function execute(interaction) {
  await interaction.reply(`• Criar emojis usando imagens aleatórias da internet com base na opção
Use \`$$\` ao invés do emoji, assim: \`$$ - Feijão carioca\`. Isso pesquisará por imagens de "Feijão carioca" na internet.

• Criar emojis usando imagens aleatórias da internet com base em termos de consulta
Use \`$pesquisa$\` ao invés do emoji, assim: \`$salada de frutas$ - James\`. Isso pesquisará por imagens de "Salada de frutas" na internet.

• Criar emojis usando link de uma imagem
Use \`$link$\` ao invés do emoji, assim: \`$http://pudim.com.br/pudim.jpg$ - Pudim\`.

• Enumerar automaticamente opções usando emojis (1 a 20)
Use \`##\` ao invés do emoji, assim: \`## - Lápis\`.

• Usar emojis normais
Adicione usando \`:nomedoemoji:\`, através do seu teclado ou \`Windows + .\`. Para emojis do servidor, é necessário informar o ID, [saiba mais](https://support.discord.com/hc/en-us/community/posts/360069335891/comments/1500000646661).`);
}

module.exports = { properties, execute };