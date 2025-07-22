const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const { tokens, prefix, controllerToken } = require('./config.json');

// Loại bỏ bot chính ra khỏi danh sách điều khiển
const botTokens = tokens.filter(token => token !== controllerToken);

// Tạo client cho bot chính
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.once('ready', () => {
  console.log(`🎮 Bot điều khiển ${client.user.tag} đã online.`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith(prefix)) return;

  const command = message.content.slice(prefix.length).trim();

  if (command === 'join') {
    const userVC = message.member.voice.channel;

    if (!userVC) {
      return message.reply('❌ Bạn phải vào voice channel trước.');
    }

    message.reply(`🔊 Đang cho các bot vào kênh: ${userVC.name}`);

    // Từng bot phụ join vào voice channel
    for (const token of botTokens) {
      const tempClient = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildVoiceStates
        ]
      });

      tempClient.once('ready', async () => {
        joinVoiceChannel({
          channelId: userVC.id,
          guildId: userVC.guild.id,
          adapterCreator: userVC.guild.voiceAdapterCreator,
          selfDeaf: true
        });

        console.log(`✅ ${tempClient.user.tag} đã vào voice.`);
      });

      tempClient.login(token);
    }
  }
});

client.login(controllerToken);
