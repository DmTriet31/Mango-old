const { tokens } = require('./config.json');
const createBot = require('./voiceBot');

const bots = tokens.map(token => createBot(token));

module.exports = bots;
