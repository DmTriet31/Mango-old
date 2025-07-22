const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, getVoiceConnection } = require('@discordjs/voice');
const googleTTS = require('google-tts-api');

function createBot(token) {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMessages
    ]
  });

  client.once('ready', () => {
    console.log(`🤖 ${client.user.tag} đã online.`);
  });

  // Hàm join voice channel
  client.joinVoice = (voiceChannel) => {
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      selfDeaf: true
    });

    return connection;
  };

  // Hàm bot nói text
  client.sayText = async (text, voiceChannel) => {
    try {
      // Nếu chưa join voice, join trước
      let connection = getVoiceConnection(voiceChannel.guild.id);
      if (!connection) {
        connection = client.joinVoice(voiceChannel);
      }

      // Tạo URL TTS
      const url = googleTTS.getAudioUrl(text, {
        lang: 'vi',
        slow: false,
        host: 'https://translate.google.com',
      });

      const player = createAudioPlayer();
      const resource = createAudioResource(url);

      player.play(resource);
      connection.subscribe(player);

      return new Promise((resolve) => {
        player.on(AudioPlayerStatus.Idle, () => {
          resolve();
        });
      });

    } catch (err) {
      console.error('❌ Lỗi khi bot nói:', err);
    }
  };

  client.login(token).catch(console.error);

  return client;
}

module.exports = createBot;
