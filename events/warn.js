module.exports = {
	name: 'warn',
	once: false,
	execute(info) {
		console.error(info, 'Evento de warn')
	},
};