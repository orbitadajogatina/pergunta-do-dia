const { SlashCommandBuilder } = require('discord.js');

const properties = new SlashCommandBuilder()
  .setName('emojis')
  .setDescription('Um guia de uso para emojis.');

const text = `- **Criar emojis usando imagens aleatórias da internet com base na opção**
Use \`$$\` ao invés do emoji, assim: \`$$ - Feijão carioca\`. Isso pesquisará por imagens de "Feijão carioca" na internet e aleatoriamente uma será selecionada para ser o emoji.
- **Criar emojis usando imagens aleatórias da internet com base em termos de consulta**
Use \`$pesquisa$\` ao invés do emoji, assim: \`$salada de frutas$ - James\`. Isso pesquisará por imagens de “Salada de frutas” na internet e aleatoriamente uma será selecionada para ser o emoji.
- **Criar emojis usando link de uma imagem**
Use \`$link$\` ao invés do emoji, assim: \`$http://pudim.com.br/pudim.jpg$ - Pudim\`. A imagem do URL será o emoji.
- **Enumerar automaticamente opções usando emojis (1 a 20)**
Use \`##\` ao invés do emoji, assim: \`## - Lápis\`.
- **Usar emojis normais**
Adicione usando \`:nomedoemoji:\`, através do seu teclado ou \`Windows + .\`. Para emojis do servidor, é necessário informar o ID, [saiba mais](https://support.discord.com/hc/en-us/community/posts/360069335891/comments/1500000646661).
  
> -# **DICA: ** Essa mesma formatação de pesquisa de imagens para criar emojis também pode ser utilizada para pesquisar imagens que acompanham perguntas.`

async function execute(interaction) {
  await interaction.reply(text);
}

module.exports = { properties, execute, id: 'emojisHelp' };