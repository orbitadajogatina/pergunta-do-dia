function link(interaction) {
  const discordUserID = interaction.user.id;
  if (discordUserID !== interaction.message.interaction?.user.id) return;

  const dataOnID = interaction.customId.split("_");
  const yorkUserID = dataOnID[2];

  database
    .from("york")
    .upsert({
      discord_user_id: discordUserID,
      york_user_id: yorkUserID,
    })
    .then((e) => {
      if (e.error) throw e;
      interaction.update({
        content:
          "✅ Parabéns! **Conta vinculada com sucesso.** Agora você vai ganhar 200 Caroços a cada pergunta aprovada!",
        components: [],
      });
    })
    .catch((e) => console.error(e));
}

module.exports = { link };
