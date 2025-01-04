'use strict';

const path = require('path');
const fs = require('fs');

async function resolveEndpoint(req, res, endpoint, method, apiAuthorization) {
    const modulePath = path.resolve(__dirname, '../api', endpoint);
    if (!fs.existsSync(`${modulePath}.js`)) {
        return res.status(404).send(`Endpoint inválido: ${endpoint}`);
    }

    const authorization = await apiAuthorization(req.get('Authorization')?.split(' ')[1]);
    if (!authorization) return res.status(401).send('Inválido ou falta o token de autorização.');
    if (authorization === 'suspended') return res.status(403).send('Suspenso.');

    try {
        const module = require(modulePath);
        if (typeof module[method] === 'function') {
            const result = await module[method](req, res, authorization);
            return res.json(result);
        }
        res.status(404).send(`Método ${method.toUpperCase()} não suportado.`);
    } catch (error) {
        console.error(`Erro no endpoint: ${endpoint}`, error);
        res.status(500).send('Erro interno.');
    }
}

module.exports = { resolveEndpoint };
