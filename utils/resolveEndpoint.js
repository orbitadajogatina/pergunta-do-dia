'use strict';

const path = require('path');
const fs = require('fs');

async function resolveEndpoint(req, res, endpoint, method, apiAuthorization) {
    const modulePath = path.resolve(__dirname, '../api', endpoint);
    if (!fs.existsSync(`${modulePath}.js`)) {
        return res.status(404).send(`Endpoint inválido: ${endpoint}`);
    }

    const authorization = await apiAuthorization(req.get('Authorization')?.split(' ')[1]);
    if (!authorization) return res.status(401).send('`Invalid token. Please get your API key on Discord using the bot or through the website.');
    if (authorization === 'suspended') return res.status(403).send('You are suspended. Please contact Enzo.');

    try {
        const module = require(modulePath);
        if (typeof module[method] === 'function') {
            const result = await module[method](req, res, authorization);
            return res.json(result);
        }
        res.status(404).send(`${method.toUpperCase()} method not available for this endpoint: ${param}`);
    } catch (error) {
        console.error(`Error loading module: ${endpoint}`, error);
        res.status(500).send(`Error: ${error.message}`);
    }
}

module.exports = { resolveEndpoint };
