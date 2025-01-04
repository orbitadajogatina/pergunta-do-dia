'use strict';

const { initializeBot } = require('./app/bot');
const { initializeWeb } = require('./app/web');
const dotenv = require('dotenv');

dotenv.config();

(async () => {
    await initializeBot();
    initializeWeb();
})();
