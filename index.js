// Pergunta do Dia Bot 1.2.0 - criado pelo Enzo da Órbita da Jogatina

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