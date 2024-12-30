const { SlashCommandBuilder, MessageFlags } = require('discord.js');

const properties = new SlashCommandBuilder()
  .setName('token')
  .setDescription('Obtenha uma chave para utilizar a API!');

async function execute(interaction) {
  const onGuild = !!interaction.guildId;

  const {data: oldData} = await database.from('api').delete().eq('owner', interaction.user.id).select().single();
  const {data} = await database.from('api').insert({
    owner: interaction.user.id, 
    uses: oldData.uses, 
    created_at: oldData.created_at, 
    last_use: oldData.last_use,
    suspended: oldData.suspended
  }).select().single();
  
  await interaction.reply({content: `Sua atual chave de API é \`${data.token}\`. Use o comando novamente para excluir essa chave e obter uma nova. [Documentação](https://rbitadajogatina.mintlify.app).`, ephemeral: onGuild, flags: MessageFlags.SuppressEmbeds});
}

module.exports = { properties, execute, id: 'api' };