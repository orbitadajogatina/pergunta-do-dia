'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const { resolveEndpoint } = require('../utils/resolveEndpoint');
const { apiAuthorization } = require('../utils/apiAuthorization');

const botWeb = express();

function initializeWeb() {
    botWeb.use(cookieParser());
    botWeb.use(express.json());

    botWeb.get('/', (_, res) => res.send('API e site disponíveis.'));

    botWeb.use('/api/v1/:endpoint', async (req, res) => {
        const { endpoint } = req.params;
        const method = req.method.toLowerCase();
        await resolveEndpoint(req, res, endpoint, method, apiAuthorization);
    });

    botWeb.listen(3000, () => console.log('API disponível em http://localhost:3000'));
}

module.exports = { initializeWeb };
