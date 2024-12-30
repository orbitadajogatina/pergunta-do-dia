// GET: Obter fila
async function get() {
  const { data: queue } = await database.rpc('get_queue');
  const lastQuestionsAuthors = JSON.parse((await database.from('variables').select().eq('key', 'lastQuestionsAuthors')).data[0]?.value || '[]');
  const queueFinalObject = await Promise.all(
    queue.map(async author => {
      const discordUser = await bot.users.fetch(author);
      const user = structuredClone(discordUser.toJSON())
  
      delete user.bot;
      delete user.system;
      delete user.flags;
      delete user.discriminator;
      delete user.avatar;
      delete user.banner;
      delete user.avatarDecoration;
      delete user.avatarDecorationData;
      delete user.defaultAvatarURL;
      delete user.accentColor;
      delete user.tag;
      delete user.createdTimestamp;
  
      return {
        alreadySent: lastQuestionsAuthors.includes(author),
        author: user
      };
    })
  );  

  return queueFinalObject;
}

module.exports = { get };