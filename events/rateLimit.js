module.exports = {
	name: 'rateLimit',
	once: false,
	execute(info) {
		console.error(info, 'Evento de rateLimit')
	},
};