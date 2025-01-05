// Pergunta do Dia Bot 1.2.0 - criado pelo Enzo da Órbita da Jogatina

"use strict";

const { initializeBot } = require("./app/bot");
const { initializeWeb } = require("./app/web");
const { initializeDatabase } = require("./app/database");
const dotenv = require("dotenv");

dotenv.config();

(async () => {
  initializeDatabase();
  await initializeBot();
  initializeWeb();
})();