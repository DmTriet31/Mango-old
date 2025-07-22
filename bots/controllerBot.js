const { Client, GatewayIntentBits } = require('discord.js');
const { prefix, controllerToken, tokens } = require('./config.json');
const bots = require('./multiVoice'); // Danh sách 5 bot phụ

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ]
});

client.once('ready', () => {
  console.log(`🎮 Bot điều khiển ${client.user.tag} đã online.`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  if (cmd === 'join') {
    const userVC = message.member.voice.channel;
    if (!userVC) return message.reply('❌ Bạn cần vào voice channel trước.');

    message.reply(`🔊 Đang cho 5 bot vào kênh ${userVC.name}...`);
    for (const bot of bots) {
      // mỗi bot join voice
      try {
        bot.joinVoice(userVC);
      } catch (e) {
        console.error('Lỗi join voice:', e);
      }
    }
  }

  if (cmd === 'say') {
    const userVC = message.member.voice.channel;
    if (!userVC) return message.reply('❌ Bạn cần vào voice channel trước.');

    if (args.length < 2) return message.reply('❌ Cách dùng: .say <bot_number: 1-5> <nội dung>');

    const botNumber = parseInt(args.shift());
    if (isNaN(botNumber) || botNumber < 1 || botNumber > 5) return message.reply('❌ Bot số từ 1 đến 5.');

    const text = args.join(' ');
    const bot = bots[botNumber - 1];

    message.reply(`🗣️ Bot #${botNumber} đang nói: "${text}"`);

    try {
      await bot.sayText(text, userVC);
    } catch (e) {
      console.error('Lỗi khi bot nói:', e);
      message.reply('❌ Lỗi khi bot nói.');
    }
  }
});

client.login(controllerToken);
