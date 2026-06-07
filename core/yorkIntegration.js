const YORK_WALLET_API_TOKEN = process.env.YORK_WALLET_API_TOKEN;
const YORK_API_TOKEN = process.env.YORK_API_TOKEN;
const YORK_URL = process.env.YORK_URL;

function getWalletAPIHeaders(key) {
  const walletAPIHeaders = new Headers();
  walletAPIHeaders.append("Content-Type", "application/json");
  walletAPIHeaders.append("x-api-key", key);

  return walletAPIHeaders;
}

async function createTransaction(body) {
  const response = await fetch(YORK_URL + "/api/wallet/transactions", {
    method: "POST",
    headers: getWalletAPIHeaders(YORK_WALLET_API_TOKEN),
    body,
  });
  const result = await response.json();

  if (!response.ok) throw result;
  return result;
}

async function payTransaction(id) {
  const payRewardResponse = await fetch(YORK_URL + "/api/transactions/" + id, {
    method: "PATCH",
    headers: getWalletAPIHeaders(YORK_API_TOKEN),
  });
  const payRewardResult = await payRewardResponse.json();

  if (!payRewardResponse.ok) throw payRewardResult;
}

async function newQuestionReward(discordUserID, questionID) {
  const { data: yorkLink } = await database
    .from("york")
    .select()
    .eq("discord_user_id", discordUserID)
    .single();
  if (!yorkLink) return;

  const transferRaw = JSON.stringify({
    receiver_id: yorkLink.york_user_id,
    amount: 100,
    currency: "caroços",
    type: "reward",
    metadata: {
      i18n: "new_question_pdd",
      question_id: questionID,
    },
  });

  try {
    const transfer = await createTransaction(transferRaw);
    await payTransaction(transfer.id);
  } catch (e) {
    console.error("Falha em pagar recompensa por nova pergunta", e);
  }
}

module.exports = { payTransaction, createTransaction, newQuestionReward };
