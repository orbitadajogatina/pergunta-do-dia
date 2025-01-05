const { cleanUserData } = require('../utils/cleanUserData');

async function get() {
  const { data: queue } = await database.rpc("get_queue");
  const lastQuestionsAuthorsData = await database.from("variables").select().eq("key", "lastQuestionsAuthors");
  const lastQuestionsAuthors = JSON.parse(lastQuestionsAuthorsData.data[0]?.value || "[]");

  const queueFinalObject = await Promise.all(
    queue.map(async (authorId) => {
      const discordUser = await bot.users.fetch(authorId);
      const user = structuredClone(discordUser.toJSON());
      cleanUserData(user);

      return {
        alreadySent: lastQuestionsAuthors.includes(authorId),
        author: user,
      };
    })
  );

  return queueFinalObject;
}

module.exports = { get };