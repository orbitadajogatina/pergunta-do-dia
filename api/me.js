const { cleanUserData } = require('../utils/cleanUserData');

async function get(req, res, authorization) {
  const discordUser = await bot.users.fetch(authorization.owner);
  const user = structuredClone(discordUser.toJSON());
  cleanUserData(user);
  return user;
}

module.exports = { get };