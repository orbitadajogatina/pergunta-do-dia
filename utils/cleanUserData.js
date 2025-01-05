function cleanUserData(user) {
  const fieldsToRemove = ['bot', 'system', 'flags', 'discriminator', 'avatar', 'banner', 'avatarDecoration', 'avatarDecorationData', 'defaultAvatarURL', 'accentColor', 'tag', 'createdTimestamp'];
  fieldsToRemove.forEach(field => delete user[field]);
}

module.exports = { cleanUserData };