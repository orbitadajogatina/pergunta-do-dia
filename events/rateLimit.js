const logError = require('../core/logError');

module.exports = {
	name: 'rateLimit',
	once: false,
	execute(info) {
		logError(info, 'Evento de rateLimit')
	},
};