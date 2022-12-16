module.exports = {
	name: 'ready',
	once: true,
	execute(bot) {
		console.log(`Supimpa! Servidor online e bot respondendo como ${bot.user.tag}.`);
		require('../core/sendCore').runCron();
	},
};