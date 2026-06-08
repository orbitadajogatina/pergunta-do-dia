const {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const { createTransaction } = require("../core/yorkIntegration");

const properties = new SlashCommandBuilder()
  .setName("furar-fila")
  .setDescription("Coloque um valor em Azeitonas para passar na frente.")
  .addNumberOption((option) =>
    option
      .setName("azeitonas")
      .setDescription("Quantidade de Azeitonas")
      .setMinValue(1.5)
      .setRequired(true),
  );

async function execute(interaction) {
  await interaction.deferReply();

  const userID = interaction.user.id;
  const { data: queue } = await database
    .from("queue")
    .select()
    .eq("user_id", userID)
    .single();

  const previousAmount = (queue?.amount ?? 0) / 100;
  const transactionAmount = interaction.options.getNumber("azeitonas");

  const message = await interaction.editReply(
    `## Azeitonas na fila\n**${previousAmount}** Azeitonas → **${previousAmount + transactionAmount}** Azeitonas\nValor anterior → Novo valor\n## Como funciona?\nNo próximo envio, o usuário com mais Azeitonas na fila terá uma pergunta dele enviada. Caso esse usuário não tenha perguntas aprovadas, a vez passa para o próximo da fila. Confira a fila usando o comando \`/fila\`.\n\n**Status do pagamento:** 🔴 Processando...`,
  );

  const skipQueueRaw = JSON.stringify({
    receiver_id: "70623b53-836f-4745-8f80-513d2fd3dda5",
    amount: transactionAmount * 100,
    currency: "azeitonas",
    type: "transfer",
    metadata: {
      i18n: "skip_queue_pdd",
      user_id: userID,
      channel_id: interaction.channelId,
      message_id: message.id,
    },
    completion_url: `https://dr.bldbr.club/channels/${interaction.guildId || "@me"}/${interaction.channelId}/${message.id}`,
  });
  const transaction = await createTransaction(skipQueueRaw);

  const payButton = new ButtonBuilder()
    .setURL(process.env.YORK_URL + "/carteira/pagar/" + transaction.id)
    .setLabel("Pagar")
    .setStyle(ButtonStyle.Link);
  const row = new ActionRowBuilder().addComponents(payButton);

  interaction.editReply({
    content: message.content.replace("🔴 Processando...", "🟡 Pendente"),
    components: [row],
  });
}

module.exports = { properties, execute, id: "skipQueue" };
