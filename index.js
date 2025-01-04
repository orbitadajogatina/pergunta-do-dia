'use strict';

const { initializeBot } = require('./app/bot');
const { initializeWeb } = require('./app/web');
const { initializeDatabase } = require('./app/database');
const dotenv = require('dotenv');

dotenv.config();

(async () => {
    await initializeBot();
    initializeDatabase()
    initializeWeb();
})();
