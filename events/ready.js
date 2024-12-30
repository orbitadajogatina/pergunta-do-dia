module.exports = {
	name: 'ready',
	once: true,
	execute(bot) {
		console.log(`Bot respondendo como ${bot.user.tag}.`);
		require('../core/sendCore').runCron();
	},
};