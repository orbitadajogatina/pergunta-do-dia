const logError = require('../core/logError');

module.exports = {
	name: 'warn',
	once: false,
	execute(info) {
		logError(info, 'Evento de warn')
	},
};