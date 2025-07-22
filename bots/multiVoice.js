const { tokens, voiceChannelId } = require('./config.json');
const createBot = require('./voiceBot');

tokens.forEach(token => {
  createBot(token, voiceChannelId);
});
