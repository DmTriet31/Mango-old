const { tokens } = require('./config.json');
const createBot = require('./joinVoice');

tokens.forEach(token => {
  createBot(token);
});
