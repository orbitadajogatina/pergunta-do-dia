"use strict";

async function apiAuthorization(token) {
  if (!token) return false;
  
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

module.exports = { apiAuthorization };