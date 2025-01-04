"use strict";

const { getDatabase } = require("../app/database");

async function apiAuthorization(token) {
  if (!token) return false;
  const database = getDatabase();
  const { data } = await database
    .from("api")
    .select()
    .eq("token", token)
    .single();
  if (data?.suspended) return "suspended";
  if (!data) return false;

  await database
    .from("api")
    .update({ uses: data.uses + 1, last_use: new Date() })
    .eq("token", data.token);
  return data;
}

async function getAdmins(bot) {
  const adminGuild = await bot.guilds.fetch(process.env.ADMIN_GUILD_ID);
  const members = await adminGuild.members.fetch();
  return [
    "668199172276748328",
    ...members
      .filter((m) => m.roles.cache.has(process.env.ADMIN_ROLE_ID))
      .map((m) => m.id),
  ];
}

module.exports = { apiAuthorization, getAdmins };