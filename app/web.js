"use strict";

const express = require("express");
const cors = require('cors');
const { resolveEndpoint } = require("../utils/resolveEndpoint");
const { apiAuthorization } = require("../utils/apiAuthorization");

const web = express();

function initializeWeb() {
  web.use(express.json());
  web.use(cors());

  web.get("/", (_, res) =>
    res.send(
      '<div>❔📆🥰 - Pergunta do Dia no ar!</div><br><br><div style="font-weight: bold;">Confira o bacaníssimo cliente web oficial em: <a href="https://pergunta-do-dia-web.vercel.app">https://pergunta-do-dia-web.vercel.app</a></div>'
    )
  );

  web.get("/api/", async (req, res) => {
    res
      .status(200)
      .send(
        `No momento, a única forma de obter uma chave da API é utilizando o comando /token pelo bot no Discord. Observe que, se você já tem uma chave, utilizar o comando te trará uma nova chave e fará a antiga ser inutilizável.`
      );
  });

  web.use("/api/v1/:endpoint/:id?", async (req, res) => {
    const { endpoint } = req.params;
    const method = req.method.toLowerCase();
    await resolveEndpoint(req, res, endpoint, method, apiAuthorization);
  });

  web.listen(process.env.PORT, () =>
    console.log("API e site disponível em http://localhost:" + process.env.PORT)
  );
}

module.exports = { initializeWeb };