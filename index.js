// Pergunta do Dia Bot 1.2.4 - criado pelo Enzo da Órbita da Jogatina

"use strict";

const dotenv = require("dotenv");
dotenv.config();

const { initializeBot } = require("./app/bot");
const { initializeWeb } = require("./app/web");
const { initializeDatabase } = require("./app/database");

(async () => {
  initializeDatabase();
  await initializeBot();
  initializeWeb();
})();

process.on('unhandledRejection', (reason, promise) => console.error(reason, promise));
process.on('uncaughtException', (reason, origin) => console.error(reason, origin));