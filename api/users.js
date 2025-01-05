const { cleanUserData } = require('../utils/cleanUserData');

async function get(req, res, authorization) {
  const id = req.params.id?.toString();
  if (id !== 'me') throw { message: `Invalid endpoint: ${req.params.endpoint}`, status: 404 };

  const discordUser = await bot.users.fetch(authorization.owner);
  const user = structuredClone(discordUser.toJSON());
  cleanUserData(user);
  return user;
}

module.exports = { get };