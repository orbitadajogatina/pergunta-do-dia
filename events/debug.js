const logError = require('../core/logError');

module.exports = {
	name: 'debug',
	once: false,
	execute(info) {
		if (info.startsWith('429')) {
			logError(info, 'Evento de debug')
		}
		// } else if (!info.toLowerCase().includes("heartbeat")) { 
		// 	logError(info, 'Evento de debug')
		// }
	},
};