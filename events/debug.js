module.exports = {
	name: 'debug',
	once: false,
	execute(info) {
		if (info.startsWith('429')) {
			console.error(info, 'Evento de debug')
		}
		// } else if (!info.toLowerCase().includes("heartbeat")) { 
		// 	console.error(info, 'Evento de debug')
		// }
	},
};