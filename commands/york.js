const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const axios = require("axios");

const properties = new SlashCommandBuilder()
  .setName("vincular-york")
  .setDescription("Vincule sua conta do York e ganhe Caroços!")
  .addStringOption((option) =>
    option
      .setName("nome-de-usuário")
      .setDescription("Nome de usuário do perfil que receberá as recompensas.")
      .setRequired(true),
  );

async function execute(interaction) {
  await interaction.deferReply();

  const username = interaction.options.getString("nome-de-usuário");
  const YORK_API_TOKEN = process.env.YORK_API_TOKEN;
  const YORK_URL = process.env.YORK_URL;

  const options = {
    method: "GET",
    url: YORK_URL + "/api/users",
    params: {
      _limit: "1",
      _page: "1",
      username,
    },
    headers: {
      "x-api-key": YORK_API_TOKEN,
    },
  };

  try {
    const { data } = await axios.request(options);

    if (data.length == 0) {
      interaction.editReply(
        `Não existe nenhum \`@${username}\` no York! Você pode ver seu @ em ${YORK_URL}/perfil.`,
      );
      return;
    }

    const profile = data[0];
    const profileEmbed = new EmbedBuilder()
      .setColor("#b40101")
      .setTitle(profile.name)
      .setURL(YORK_URL + "/perfil/" + profile.username)
      .setDescription(`@${profile.username}\n${profile.bio ?? ''}`)
      .setThumbnail(profile.avatar || null);

    const continueButton = new ButtonBuilder()
      .setCustomId("york_link_" + profile.id)
      .setLabel("Continuar")
      .setStyle(ButtonStyle.Primary);
    const row = new ActionRowBuilder().addComponents(continueButton);

    interaction.editReply({
      content: `Você dará as recompensas obtidas com o uso deste bot para \`@${username}\`. Se isso está certo, clique em "Continuar"!`,
      embeds: [profileEmbed],
      components: [row],
    });
  } catch (error) {
    console.error(error);
    interaction.editReply(
      "Houve um erro de conexão com os servidores do York. Tente novamente mais tarde.",
    );
  }
}

module.exports = { properties, execute, id: "york" };
